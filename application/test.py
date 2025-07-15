def max_employees(T, N, A, B, K):
    # Count of odd and even workshops
    odd = (N + 1) // 2
    even = N // 2

    def can_attend(x):  # Can x employees each attend at least K workshops?
        total_sessions = x * K
        # Assign odd sessions first (room A)
        max_odd = min(x * ((K + 1) // 2), odd * A)
        # Assign even sessions next (room B)
        max_even = min(x * (K // 2), even * B)
        return max_odd + max_even >= total_sessions

    # Binary search for max x
    low, high = 0, T
    ans = 0
    while low <= high:
        mid = (low + high) // 2
        if can_attend(mid):
            ans = mid
            low = mid + 1
        else:
            high = mid - 1
    return ans


# Example Inputs
print(max_employees(5, 4, 5, 3, 3))  # Output: 5
print(max_employees(10, 3, 4, 4, 3)) # Output: 4