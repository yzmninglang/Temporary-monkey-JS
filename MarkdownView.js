public int[] twoSum(int[] nums, int target) {
    // 创建哈希表，用于存储数字到索引的映射
    Map<Integer, Integer> numMap = new HashMap<>();
    
    // 遍历数组
    for (int i = 0; i < nums.length; i++) {
        // 计算当前数字的补数
        int complement = target - nums[i];
        
        // 如果补数存在于哈希表中，说明找到了答案
        if (numMap.containsKey(complement)) {
            return new int[] { numMap.get(complement), i };
        }
        
        // 将当前数字及其索引存入哈希表
        numMap.put(nums[i], i);
    }
    
    // 如果没有找到答案，抛出异常
    throw new IllegalArgumentException("No solution");
}
