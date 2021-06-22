# This is a sudoku generator, which generates a unique sudoku randomly
# But unrandomly the sudoku it generates won't have any extraneous digits

# Since it's so random the sudoku aren't necessarily good
# Often half of the grid is filled by singles
# In fact the following sudoku is super easy, except for this one WXYZ wing at the end.
# 240100000
# 007800600
# 010003900
# 000701000
# 000004200
# 000900870
# 060020000
# 005030004
# 070000050

# So far it seems to take anywhere from a to b seconds:
# 5.320441s
# 191.2783888s (wow!)

# It takes so long since it checks a sudoku's validity by bruteforce
# So the longer it takes, the harder it is to bruteforce the solution.
# And generally hard to bruteforce sudokus are ... vaguely harder to solve.

# Here's the 191 second sudoku (very easy)
"""
000000007
000069000
190000000
042100800
030050200
800000650
000705004
001020008
000400100
"""

# Credits to www.101computing.net/sudoku-generator-algorithm/
# Modified

# import turtle
import random
from random import shuffle
import time
from time import sleep

starttime = time.time_ns()

digits = [1, 2, 3, 4, 5, 6, 7, 8, 9]
digitIndices = [digit - 1 for digit in digits]

# initialise empty 9 by 9 grid
grid = []
for _ in range(9):
    grid.append([0, 0, 0, 0, 0, 0, 0, 0, 0])

# myPen = turtle.Turtle()
# turtle.tracer(0)
# myPen.speed(0)
# myPen.color("#000000")
# myPen.hideturtle()

# # Drawing variables
# topLeft_x = -150
# topLeft_y = 150
# intDim = 35


# def text(message, x, y, size):
#     FONT = ('Arial', size, 'normal')
#     myPen.penup()
#     myPen.goto(x, y)
#     myPen.write(message, align="left", font=FONT)

# # A procedure to draw the grid on screen using Python Turtle
# def drawGrid(grid):
#     for row in digitIndices:
#         if (row % 3) == 0:
#             myPen.pensize(3)
#         else:
#             myPen.pensize(1)
#             myPen.penup()
#             myPen.goto(topLeft_x, topLeft_y-row*intDim)
#             myPen.pendown()
#             myPen.goto(topLeft_x+9*intDim, topLeft_y-row*intDim)
#     for col in digitIndices:
#         if (col % 3) == 0:
#             myPen.pensize(3)
#         else:
#             myPen.pensize(1)
#             myPen.penup()
#             myPen.goto(topLeft_x+col*intDim, topLeft_y)
#             myPen.pendown()
#             myPen.goto(topLeft_x+col*intDim, topLeft_y-9*intDim)

#     for row in digitIndices:
#         for col in digitIndices:
#             if grid[row][col] != 0:
#                 text(grid[row][col], topLeft_x+col*intDim +
#                     9, topLeft_y-row*intDim-intDim+8, 18)


# A function to check if the grid is full
def checkGrid(grid):
    for row in digitIndices:
        for col in digitIndices:
            if grid[row][col] == 0:
                return False

    # We have a complete grid!
    return True

def getColumn(col, grid):
    return [row[col] for row in grid]

def getBox(row, col, grid):
    if row < 3:
        if col < 3:
            return [grid[i][0:3] for i in range(0, 3)]
        elif col < 6:
            return [grid[i][3:6] for i in range(0, 3)]
        else:
            return [grid[i][6:9] for i in range(0, 3)]
    elif row < 6:
        if col < 3:
            return [grid[i][0:3] for i in range(3, 6)]
        elif col < 6:
            return [grid[i][3:6] for i in range(3, 6)]
        else:
            return [grid[i][6:9] for i in range(3, 6)]
    else:
        if col < 3:
            return [grid[i][0:3] for i in range(6, 9)]
        elif col < 6:
            return [grid[i][3:6] for i in range(6, 9)]
        else:
            return [grid[i][6:9] for i in range(6, 9)]


# A backtracking/recursive function to check all possible combinations of numbers until a solution is found
def solutionCount(grid, depth=1, start=0):
    if depth > 81:
        print(grid)
        raise ValueError("too much depth")

    numberOfSolutions = 0

    # Find next empty cell
    for i in range(start, 81):
        row = i // 9
        col = i % 9

        # When there is an empty cell, add up the possibilities for each empty cell,
        # and return
        if grid[row][col] == 0:
            for value in digits:
                # Check that this value has not already be used on this row
                if not (value in grid[row]):
                    # Check that this value has not already be used on this column
                    if not (value in getColumn(col, grid)):
                        box = getBox(row, col, grid)

                        # Check that this value has not already be used on this 3x3 box
                        if not value in (box[0] + box[1] + box[2]):
                            grid[row][col] = value
                            numberOfSolutions += solutionCount(grid, depth+1, i)
                            grid[row][col] = 0
            return numberOfSolutions

    # No empty cells, so 1 solution
    return 1



# Generates a random filled grid
# Almost the same as solvegrid
def fillGrid(grid, start=0):
    for i in range(start, 81):
        row = i // 9
        col = i % 9
        if grid[row][col] == 0:
            randomDigits = digits[:] # Different
            shuffle(randomDigits) # Different
            for digit in randomDigits: # Different
                if not (digit in grid[row]):
                    if not (digit in getColumn(col, grid)):
                        box = getBox(row, col, grid)
                        if not digit in (box[0] + box[1] + box[2]):
                            grid[row][col] = digit
                            if checkGrid(grid): # Different
                                return True  # Different
                            if fillGrid(grid, i): # Different
                                return True
                            grid[row][col] = 0
            break

    return False


#Generate a Fully Solved Grid
fillGrid(grid)
# drawGrid(grid)
# myPen.getscreen().update()
sleep(1)


# Start Removing Numbers one by one

success = True
numLeft = 81
fails = []
while success:
    successes = []

    # Optimization: When there's only 17 left, you can't remove any more
    if numLeft > 17:
        # Loop over all digits and find the ones that can be taken off
        for row in digitIndices:
            for col in digitIndices:
                # Optimization: If already failed skip it
                identifier = str(row) + " " + str(col)
                if identifier in fails:
                    continue

                if grid[row][col] != 0:
                    # Remember its cell value in case we need to put it back
                    backup = grid[row][col]
                    grid[row][col] = 0

                    # Take a full copy of the grid
                    copyGrid = []
                    for r in digitIndices:
                        copyGrid.append([])
                        for c in digitIndices:
                            copyGrid[r].append(grid[r][c])

                    grid[row][col] = backup

                    result = solutionCount(copyGrid)
                    if result == 1:
                        successes.append([row, col])
                        print(numLeft, row, col, "SUCCESS")
                    else:
                        fails.append(identifier)
                        print(numLeft, row, col, "FAIL", result)


    if len(successes) == 0:
        success = False
    else:
        row, col = random.choice(successes)
        grid[row][col] = 0
        numLeft -= 1

    # myPen.clear()
    # drawGrid(grid)
    # myPen.getscreen().update()

print("\n".join([
    str(row[0]) + str(row[1]) + str(row[2]) + str(row[3]) + str(row[4]) +
    str(row[5]) + str(row[6]) + str(row[7]) + str(row[8]) for row in grid]))

finishtime = time.time_ns()
timetaken = finishtime - starttime
print(f"{timetaken / 1_000_000_000}s")
input("Sudoku Grid Ready. Press enter to finish")
