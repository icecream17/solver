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
# 2.770194907s (wow!)
# 819.054982936s (WOWWWWWWW!)

# It takes so long since it checks a sudoku's validity by bruteforce
# So the longer it takes, the harder it is to bruteforce the solution.
# And generally hard to bruteforce sudokus are ... vaguely harder to solve.

# Here's the 819 second sudoku (hard)
"""
004000000
805000000
070500030
000000800
000706004
000400316
009100070
300080100
007090005
"""

# Here's the 2.770194907 second sudoku (somewhat easy)
"""
006040000
050000019
812050004
080239000
090084000
004500000
001000003
600020700
070000400
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
for row in range(9):
    grid.append([])
    for _ in range(9):
        grid[row].append([1, 2, 3, 4, 5, 6, 7, 8, 9])

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
            if len(grid[row][col]) != 1:
                return False

    # We have a complete grid!
    return True

def getColumn(col, grid):
    return [row[col] for row in grid]

# boxRow = [0, 0, 0, 3, 3, 3, 6, 6, 6]
# boxColumn = [0, 0, 0, 1, 1, 1, 2, 2, 2]
start = [0, 0, 0, 3, 3, 3, 6, 6, 6]
def getBox(row, col, grid):
    startRow = start[row]
    startColumn = start[col]

    box = []
    for row2 in range(startRow, startRow + 3):
        for col2 in range(startColumn, startColumn + 3):
            box.append(grid[row2][col2])
    return box


def getBoxI(index, grid):
    startRow = index // 3
    startColumn = index % 3

    box = []
    for row2 in range(startRow, startRow + 3):
        for col2 in range(startColumn, startColumn + 3):
            box.append(grid[row2][col2])
    return box


def groupHas(group, digit):
    for cell in group:
        if len(cell) == 1 and cell[0] == digit:
            return True

    return False


def _affects(row, col):
    total = []
    for i in range(9):
        if i != row:
            total.append((i, col))

            if i // 3 == row // 3:
                for j in range(9):
                    if j != col and j // 3 == col // 3: # And i != row
                        total.append((i, j))
        if i != col:
            total.append((row, i))

    return total


affects = []
for i in range(9):
    affects.append([])
    for j in range(9):
        affects[i].append(_affects(i, j))


def hiddenSingleCheck(group, digit):
    has = [cell for cell in group if digit in cell]
    if len(has) == 1:
        has[0].clear()
        has[0].append(digit)
        return True
    return False


def isHiddenSingle(row, col, grid):
    if len(grid[row][col]) == 1:
        return False

    for group in (grid[row], getColumn(col, grid), getBox(row, col, grid)):
        possible = grid[row][col][:]
        for cell in group:
            if cell is not grid[row][col]:
                for digit in cell:
                    if digit in possible:
                        possible.remove(digit)
        if possible:
            return possible
    return False


def isEliminated(row, col, digit, grid):
    for group in (grid[row], getColumn(col, grid), getBox(row, col, grid)):
        for cell in group:
            if cell is not grid[row][col]:
                if len(cell) == 1 and cell[0] == digit:
                    return True
    return False


def eliminations(grid):
    do = True
    done = []
    solved = {
        "row": [[], [], [], [], [], [], [], [], []],
        "col": [[], [], [], [], [], [], [], [], []],
        "box": [[], [], [], [], [], [], [], [], []],
    }

    def len1(cell, row, col):
        digit = cell[0]
        if not digit in solved["row"][row]:
            solved["row"][row].append(digit)
        if not digit in solved["col"][col]:
            solved["col"][col].append(digit)
        if not digit in solved["box"][int(start[row] + start[col]/3)]:
            solved["box"][int(start[row] + start[col]/3)].append(digit)

        if not cell in done:
            done.append(cell)
            for row2, col2 in affects[row][col]:
                cell2 = grid[row2][col2]
                if digit in cell2:
                    cell2.remove(digit)
                    if len(cell2) == 1:
                        len1(cell2, row2, col2)
                    do = True

    while do:
        do = False
        for row in range(9):
            for col in range(9):
                cell = grid[row][col]
                if len(cell) == 1:
                    len1(cell, row, col)

                if not cell in done:
                    result = isHiddenSingle(row, col, grid)
                    if result:
                        done.append(grid[row][col])
                        grid[row][col] = result
                        do = True


        # for digit in digits:
        #     for i in range(9):
        #         condition = (
        #             (not (digit in solved["row"][i]) and hiddenSingleCheck(grid[i], digit)) or
        #             (not (digit in solved["col"][i]) and hiddenSingleCheck(getColumn(i, grid), digit)) or
        #             (not (digit in solved["box"][i]) and hiddenSingleCheck(getBoxI(i, grid), digit))
        #         )
        #         if condition:
        #             do = True

    return grid


# A backtracking/recursive function to check all possible combinations of numbers until a solution is found
def solutionCount(grid, depth=1, start=0):
    if depth > 81:
        printGrid(grid)
        raise ValueError("too much depth")
    grid = eliminations(grid)

    numberOfSolutions = 0

    # Find next empty cell
    for i in range(start, 81):
        row = i // 9
        col = i % 9

        # When there is an empty cell, add up the possibilities for each empty cell,
        # and return
        if len(grid[row][col]) != 1:
            for digit in grid[row][col]:
                # Check that this value has not already be used on this row, column, or box
                if not groupHas(grid[row], digit):
                    if not groupHas(getColumn(col, grid), digit):
                        if not groupHas(getBox(row, col, grid), digit):
                            copy = copyGrid(grid)
                            copy[row][col] = [digit]
                            numberOfSolutions += solutionCount(copy, depth+1, i)

                            # early exit on multiple solutions
                            # remove this if you actually need an accurate solution count
                            # if numberOfSolutions > 1:
                            #     return numberOfSolutions + 1e7
            return numberOfSolutions

    # No empty cells, so 1 solution
    return 1



# Generates a random filled grid
# Almost the same as solvegrid
def fillGrid(grid, start=0):
    for i in range(start, 81):
        row = i // 9
        col = i % 9
        if len(grid[row][col]) > 1:
            randomDigits = digits[:] # Different
            shuffle(randomDigits) # Different
            for digit in randomDigits: # Different
                if not groupHas(grid[row], digit):
                    if not groupHas(getColumn(col, grid), digit):
                        if not groupHas(getBox(row, col, grid), digit):
                            grid[row][col] = [digit]
                            if fillGrid(grid, i): # Different
                                return True
                            grid[row][col] = [1, 2, 3, 4, 5, 6, 7, 8, 9]

            # Couldn't place a digit
            return False

    # No more empty cells!
    return True


def printGrid(grid, simple=False):
    gridstr = ""
    for row in grid:
        for cell in row:
            if simple:
                gridstr += str(cell[0])
            else:
                for digit in digits:
                    if digit in cell:
                        gridstr += str(digit)
                    else:
                        gridstr += "0"
            gridstr += " "
        gridstr += "\n"

    print(gridstr)


def copyGrid(grid):
    copy = []
    for r in digitIndices:
        copy.append([])
        for c in digitIndices:
            copy[r].append(grid[r][c][:])
    return copy

# Generate a Fully Solved Grid
fillGrid(grid)
printGrid(grid, True)
# drawGrid(grid)
# myPen.getscreen().update()
sleep(1)


# Start adding candidates one by one

success = True
numLeft = 729 - 81
fails = []
notdone = []
for row in digitIndices:
    for col in digitIndices:
        for value in digits:
            notdone.append((row, col, value))

while success:
    # if time.time_ns() - starttime > 1_000_000_000_000:
    #     printGrid(grid)
    #     raise ValueError("too slow")
    successes = []

    # Optimization: When there's only 17 left, you can't remove any more
    if numLeft > 17:
        # Loop over all digits and find the ones that can be taken off
        for hmm in notdone:
            row, col, value = hmm
            if value in grid[row][col]:
                notdone.remove(hmm)
            else:
                # Take a full copy of the grid
                copy = copyGrid(grid)
                copy[row][col].append(value)

                # Optimization: Don't check solutionCount for first eight
                result = bool(isHiddenSingle(row, col, copy)) or isEliminated(row, col, digit, copy) or solutionCount(copy) if numLeft < 729 - 81 - 8 else 1
                if result == 1:
                    successes.append(hmm)
                    #print(numLeft, row, col, value, "SUCCESS")
                elif result == 0:
                    printGrid(copy)
                    print("vs")
                    printGrid(grid)

                    copy = copyGrid(grid)
                    copy[row][col].append(value)
                    def eliminations(grid):
                        return grid
                    print("vs")
                    print(solutionCount(copy))
                    print(copy)

                    raise ValueError(result)
                else:
                    notdone.remove(hmm)
                    fails.append(hmm)
                    print(numLeft, row, col, value, len(notdone), "FAIL", result)


    if len(successes) == 0:
        success = False
    else:
        hmm = random.choice(successes)
        notdone.remove(hmm)
        row, col, digit = hmm
        cell = grid[row][col]
        for i in range(len(cell) + 1):
            if i == len(cell):
                cell.append(digit)
            elif cell[i] > digit:
                cell.insert(i, digit)
                break
        numLeft -= 1
        print(numLeft, row, col, digit, len(notdone), "ADDED")

    # myPen.clear()
    # drawGrid(grid)
    # myPen.getscreen().update()

print(grid)
printGrid(grid)

finishtime = time.time_ns()
timetaken = finishtime - starttime
print(f"{timetaken / 1_000_000_000}s")
input("Sudoku Grid Ready. Press enter to finish")
