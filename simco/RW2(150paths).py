import random
import matplotlib.pyplot as plt
import matplotlib.cm as cm                              
from matplotlib.ticker import FuncFormatter

plt.style.use('dark_background')
# plt.style.use('default')

def rollDice():
    roll = random.randint(1, 2)
    if roll == 1:
        return False
    else:
        return True

def simple_bettor(funds, initial_wager, wager_count):
    value = funds
    wager = initial_wager
    path = [value]
    current = 1

    while current <= wager_count:
        if rollDice():
            value += wager
        else:
            value -= wager

        path.append(value)

        # if value <= 0:
        #     break

        current += 1

    return path

rounds = 1000
bettors = 150
start = 0

fig, ax = plt.subplots(figsize=(12, 6))

x = 0
while x < bettors:
    path = simple_bettor(start, 1, rounds)
    ax.plot(path, color=cm.turbo(x / bettors), linewidth=0.6, alpha=0.6)             #gradiants: plasma viridis cool spring turbo
    x += 1

# Labels
# ax.set_title(str(bettors) + ' bettors, ' + str(rounds) + ' bets each', fontsize=16)
ax.set_xlabel('Number of steps', fontsize=12)
ax.set_ylabel('Wealth', fontsize=12)

# Axes
ax.set_xlim(0, rounds)
ax.set_xticks(range(0, rounds + 1, rounds // 10))
ax.set_ylim(-120,120)
ax.yaxis.set_major_formatter(FuncFormatter(lambda v, pos: f'{int(v):,}'))

# Extras
ax.grid(True, color='gray', alpha=0.3, linestyle='--')
ax.axhline(start, color='white', linewidth=1, linestyle=':', label='Starting funds')
ax.legend()
ax.spines['top'].set_visible(False)
ax.spines['right'].set_visible(False)

plt.show()