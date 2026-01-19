import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';

interface ListItemProps {
  title: string;
  subtitle?: string;
  icon?: string;
  rightIcon?: string;
  onPress?: () => void;
}

export const ListItem: React.FC<ListItemProps> = ({
  title,
  subtitle,
  icon,
  rightIcon = '›',
  onPress,
}) => {
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.6}
    >
      {icon && <Text style={styles.icon}>{icon}</Text>}
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {rightIcon && <Text style={styles.rightIcon}>{rightIcon}</Text>}
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5EA',
  },
  icon: {
    fontSize: 24,
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    color: '#000',
    fontWeight: '400',
  },
  subtitle: {
    fontSize: 15,
    color: '#8E8E93',
    marginTop: 2,
  },
  rightIcon: {
    fontSize: 20,
    color: '#C7C7CC',
    marginLeft: 8,
  },
});
