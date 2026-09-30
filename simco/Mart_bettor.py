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

def martingale_bettor(funds, initial_wager, wager_count):
    value = funds
    wager = initial_wager
    path = [value]
    current = 1

    while current <= wager_count:
        if rollDice():
            value += wager              #if true, wager added 
            wager = initial_wager       #if True, keep the current wager
        else:
            value -= wager
            wager = wager * 2

        path.append(value)
        current += 1                    #increase step count

    return path

rounds = 500
bettors = 100
start = 10000
base_wager = 100

fig, ax = plt.subplots(figsize=(12, 6))

n = 0
while n < bettors:
    path = martingale_bettor(start, base_wager, rounds)
    ax.plot(path, color=cm.turbo(n / bettors), linewidth=0.6, alpha=0.6)             #gradiants: plasma viridis cool spring turbo
    n += 1

# Labels
# ax.set_title(str(bettors) + ' bettors, ' + str(rounds) + ' bets each', fontsize=16)
ax.set_xlabel('Number of steps', fontsize=12)
ax.set_ylabel('Wealth', fontsize=12)

# Axes
ax.set_xlim(0, rounds)
ax.set_xticks(range(0, rounds + 1, rounds // 10))
ax.set_ylim(-100000,50000)
ax.yaxis.set_major_formatter(FuncFormatter(lambda v, pos: f'{int(v):,}'))

# Extras
ax.grid(True, color='gray', alpha=0.3, linestyle='--')
ax.axhline(start, color='white', linewidth=1, linestyle=':', label='Starting funds')
ax.legend()
ax.spines['top'].set_visible(False)
ax.spines['right'].set_visible(False)

plt.show()