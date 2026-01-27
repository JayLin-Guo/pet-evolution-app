#!/usr/bin/env python3
"""
简单的 Spine 1.9 到 3.8 转换脚本（单文件版本）
专门用于转换 mon_earth_dragon_02
"""

import json
import os

def convert_file():
    """转换单个文件"""
    input_file = "base_mon_earth_dragon_02.json"
    output_file = "mon_earth_dragon_02_v38.json"
    
    print(f"读取文件: {input_file}")
    
    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # 转换 skeleton
    if 'skeleton' in data:
        skeleton = data['skeleton']
        # 移除 1.9 特有的字段
        skeleton.pop('hash', None)
        skeleton.pop('images', None)
        skeleton.pop('audio', None)
        # 确保有 spine 版本号
        if 'spine' not in skeleton:
            skeleton['spine'] = '3.8.75'
    
    # 转换 skins: 从对象格式转为数组格式
    if 'skins' in data and isinstance(data['skins'], dict):
        skins_array = []
        for skin_name, skin_data in data['skins'].items():
            skins_array.append({
                "name": skin_name,
                "attachments": skin_data
            })
        data['skins'] = skins_array
    
    # 保存
    print(f"保存文件: {output_file}")
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=4, ensure_ascii=False)
    
    print("转换完成！")

if __name__ == "__main__":
    convert_file()
