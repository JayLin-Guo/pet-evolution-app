#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
简化版：批量转换 Spine JSON 文件从 1.9.17 格式到 3.8.75 格式
生成新文件（添加 _v38 后缀），不修改原文件
"""

import json
import re
from pathlib import Path
from typing import Optional


def _safe_get(d, key, default=None):
    if isinstance(d, dict):
        return d.get(key, default)
    return default


def find_template_skeleton(dir_path: Path, preferred_base: Optional[str] = None):
    """在同目录中寻找一个可用的 Spine 3.8.75 JSON 作为模板，返回其 skeleton 字段(dict)。

    优先级：
    1) 与当前角色同名的 <preferred_base>.json (且 spine==3.8.75)
    2) 目录里任意 .json（排除 *_v38、*-new），找到第一个 spine==3.8.75
    """
    candidates = []
    if preferred_base:
        candidates.append(dir_path / f"{preferred_base}.json")

    # 兜底：扫描目录内所有 json
    candidates.extend(sorted(dir_path.glob("*.json")))

    seen = set()
    for p in candidates:
        if p in seen:
            continue
        seen.add(p)

        name = p.name
        if "_v38" in p.stem or "-new.json" in name:
            continue

        try:
            with open(p, "r", encoding="utf-8") as f:
                data = json.load(f)
            sk = data.get("skeleton") or {}
            if _safe_get(sk, "spine") == "3.8.75":
                return sk
        except Exception:
            continue
    return None


def convert_spine_json(old_data):
    """将 Spine 旧格式“尽量不破坏内容”地转成 Spine 3.8.75 可识别结构。

    注意：这不是“真正的 Spine 版本升级器”（无法把 1.9 的所有动画/曲线规则升级到 3.8）。
    我们只做最小结构调整，避免把 skeleton 的关键视口参数写坏。
    """
    old_skeleton = old_data.get('skeleton') or {}

    def estimate_bounds_from_skins(data):
        """从 skins/attachments 估算 skeleton 的包围盒。

        说明：这是近似估算（忽略 attachment rotation、bone rotation/scale 等复杂变换）。
        但在多数 2D 资源里足够让 SpinePlayer 计算出合理视口，避免 width/height=0 导致看不见。
        """
        skins_raw = data.get("skins", {})
        if not isinstance(skins_raw, dict):
            return None

        min_x = None
        min_y = None
        max_x = None
        max_y = None

        for _skin_name, skin in skins_raw.items():
            if not isinstance(skin, dict):
                continue
            for _slot_name, slot in skin.items():
                if not isinstance(slot, dict):
                    continue
                for _att_name, att in slot.items():
                    if not isinstance(att, dict):
                        continue
                    w = att.get("width")
                    h = att.get("height")
                    if not isinstance(w, (int, float)) or not isinstance(h, (int, float)):
                        continue
                    x = att.get("x", 0)
                    y = att.get("y", 0)
                    if not isinstance(x, (int, float)) or not isinstance(y, (int, float)):
                        x, y = 0, 0

                    left = x - w / 2
                    right = x + w / 2
                    bottom = y - h / 2
                    top = y + h / 2

                    min_x = left if min_x is None else min(min_x, left)
                    min_y = bottom if min_y is None else min(min_y, bottom)
                    max_x = right if max_x is None else max(max_x, right)
                    max_y = top if max_y is None else max(max_y, top)

        if min_x is None or min_y is None or max_x is None or max_y is None:
            return None
        return {
            "x": float(min_x),
            "y": float(min_y),
            "width": float(max_x - min_x),
            "height": float(max_y - min_y),
        }

    # 关键：不要硬编码 x/y/width/height，否则很容易导致渲染看不到
    x = old_skeleton.get('x', 0)
    y = old_skeleton.get('y', 0)
    width = old_skeleton.get('width', 0)
    height = old_skeleton.get('height', 0)
    if not isinstance(width, (int, float)) or not isinstance(height, (int, float)) or width <= 0 or height <= 0:
        est = estimate_bounds_from_skins(old_data)
        if est:
            x = est["x"]
            y = est["y"]
            width = est["width"]
            height = est["height"]

    skeleton_out = {
        'hash': old_skeleton.get('hash', ''),
        'spine': '3.8.75',
        'x': x,
        'y': y,
        'width': width,
        'height': height,
        'images': old_skeleton.get('images', ''),
        'audio': old_skeleton.get('audio', ''),
    }

    skins = old_data.get('skins', {})
    # 3.8 通常是 skins 数组：[{name, attachments}]
    if isinstance(skins, dict):
        skins_out = [{'name': k, 'attachments': v} for k, v in skins.items()]
    elif isinstance(skins, list):
        skins_out = skins
    else:
        skins_out = []

    return {
        'skeleton': skeleton_out,
        'bones': old_data.get('bones', []),
        'slots': old_data.get('slots', []),
        'skins': skins_out,
        'animations': old_data.get('animations', {}),
    }


def process_json_file(file_path):
    """处理 JSON 文件"""
    file_path = Path(file_path)
    
    # 跳过新文件和已转换的文件
    if '-new.json' in file_path.name:
        return None
    if '_v38' in file_path.stem:
        return None
    
    # 检查是否已经是新格式
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            old_data = json.load(f)
        
        skeleton = old_data.get('skeleton', {}) or {}
        current_version = skeleton.get('spine', 'unknown')
        
        # 生成新文件名（如果已存在 _v38.json，则覆盖，方便多次调整脚本后重新生成）
        new_file_path = file_path.parent / f"{file_path.stem}_v38.json"
        
        # 如果已经是 3.8.75：不要"再转换"，直接复制生成 _v38.json（避免把可用数据写坏）
        if current_version == '3.8.75':
            new_data = old_data
        else:
            # 转换（尽量保持内容）
            new_data = convert_spine_json(old_data)

            # 关键增强：如果同目录里存在"可用的 3.8.75 JSON"，用它的 skeleton 覆盖视口参数
            preferred_base = file_path.parent.name  # 你的素材规则：文件夹前缀与 json 前缀相同
            tpl = find_template_skeleton(file_path.parent, preferred_base=preferred_base)
            if tpl:
                out_sk = new_data.get("skeleton") or {}
                for k in ("hash", "x", "y", "width", "height", "images", "audio"):
                    if k in tpl:
                        out_sk[k] = tpl.get(k)
                out_sk["spine"] = "3.8.75"
                new_data["skeleton"] = out_sk
        
        # 写入新文件
        with open(new_file_path, 'w', encoding='utf-8') as f:
            json.dump(new_data, f, ensure_ascii=False, separators=(',', ':'))
        
        print(f"  [成功] {file_path.name} -> {new_file_path.name}")
        return True
        
    except json.JSONDecodeError as e:
        print(f"  [错误] JSON 解析错误: {e}")
        return False
    except Exception as e:
        print(f"  [错误] {e}")
        return False


def process_atlas_file(file_path):
    """处理 Atlas 文件（更新其中的 JSON 文件引用）"""
    file_path = Path(file_path)
    
    # 跳过已转换的文件
    if '_v38' in file_path.stem:
        return None
    
    try:
        # 读取 atlas 文件
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 检查是否需要更新（查找 .json 引用）
        # 匹配模式：文件名.json（不包括路径中的.json）
        pattern = r'(\w+)\.json'
        
        def replace_json_ref(match):
            json_name = match.group(1)
            # 如果对应的 _v38.json 文件存在，则更新引用
            json_file = file_path.parent / f"{json_name}.json"
            v38_json_file = file_path.parent / f"{json_name}_v38.json"
            
            if v38_json_file.exists():
                return f"{json_name}_v38.json"
            return match.group(0)  # 保持不变
        
        new_content = re.sub(pattern, replace_json_ref, content)
        
        # 如果内容有变化，生成新文件
        if new_content != content:
            new_file_path = file_path.parent / f"{file_path.stem}_v38.atlas"
            if new_file_path.exists():
                return None  # 目标文件已存在，跳过
            
            with open(new_file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            
            print(f"  [成功] {file_path.name} -> {new_file_path.name}")
            return True
        
        return None  # 没有需要更新的内容
        
    except Exception as e:
        print(f"  [错误] Atlas 处理错误: {e}")
        return False


def main():
    """主函数"""
    import sys
    
    if len(sys.argv) < 2:
        print("用法: python batch_convert_spine_simple.py <目录路径>")
        print("示例: python batch_convert_spine_simple.py D:\\path\\to\\spine-role")
        return
    
    target_dir = Path(sys.argv[1])
    if not target_dir.exists():
        print(f"[错误] 目录不存在: {target_dir}")
        return
    
    # 查找所有 JSON 和 Atlas 文件
    print("正在扫描文件...")
    json_files = list(target_dir.rglob('*.json'))
    atlas_files = list(target_dir.rglob('*.atlas'))
    
    if not json_files and not atlas_files:
        print("[!] 未找到 JSON 或 Atlas 文件")
        sys.exit(0)
    
    print(f"[目录] {target_dir}")
    print(f"[文件] 找到 {len(json_files)} 个 JSON 文件")
    print(f"[文件] 找到 {len(atlas_files)} 个 Atlas 文件")
    print("=" * 60)
    
    success = 0
    skip = 0
    error = 0
    
    # 先处理 JSON 文件（因为 atlas 需要引用转换后的 JSON）
    if json_files:
        print("\n[步骤 1] 处理 JSON 文件...")
        files_by_dir = {}
        for json_file in json_files:
            dir_key = str(json_file.parent)
            if dir_key not in files_by_dir:
                files_by_dir[dir_key] = []
            files_by_dir[dir_key].append(json_file)
        
        for dir_path, files in sorted(files_by_dir.items()):
            rel_dir = Path(dir_path).relative_to(target_dir) if target_dir != Path(dir_path) else Path('.')
            print(f"\n[目录] {rel_dir}")
            
            for json_file in sorted(files):
                result = process_json_file(json_file)
                if result is True:
                    success += 1
                elif result is None:
                    skip += 1
                else:
                    error += 1
    
    # 再处理 Atlas 文件
    if atlas_files:
        print("\n[步骤 2] 处理 Atlas 文件...")
        files_by_dir = {}
        for atlas_file in atlas_files:
            dir_key = str(atlas_file.parent)
            if dir_key not in files_by_dir:
                files_by_dir[dir_key] = []
            files_by_dir[dir_key].append(atlas_file)
        
        for dir_path, files in sorted(files_by_dir.items()):
            rel_dir = Path(dir_path).relative_to(target_dir) if target_dir != Path(dir_path) else Path('.')
            print(f"\n[目录] {rel_dir}")
            
            for atlas_file in sorted(files):
                result = process_atlas_file(atlas_file)
                if result is True:
                    success += 1
                elif result is None:
                    skip += 1
                else:
                    error += 1
    
    print("\n" + "=" * 60)
    print(f"[统计] 处理完成:")
    print(f"   [成功] {success} 个")
    print(f"   [跳过] {skip} 个")
    if error > 0:
        print(f"   [错误] {error} 个")


if __name__ == '__main__':
    main()

