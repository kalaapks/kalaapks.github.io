import random
import matplotlib.pyplot as plt
import matplotlib.cm as cm
from matplotlib.ticker import FuncFormatter

plt.style.use('dark_background')

def rollDice():
    roll = random.randint(1, 2)     # fair coin: 50% win, 50% lose
    if roll == 1:
        return False
    else:
        return True

def martingale_bettor(funds, initial_wager, wager_count):
    value = funds
    wager = initial_wager
    path = [value]
    current = 1
    stopped = False

    while current <= wager_count:
        if rollDice():
            value += wager
            wager = initial_wager
        else:
            value -= wager
            wager = wager * 2

        path.append(value) 

        if wager > value:
            stopped = True                #this will help counting how many stops early, whenever this is true, we count it as early leave
            break

        current += 1

    while len(path) < wager_count + 1:
        path.append(value)

    return path, stopped                  #nothing is printed but both info of the path and if someone left early is kept

rounds = 1000
bettors = 100
start = 10000
base_wager = 100

fig, ax = plt.subplots(figsize=(12, 6))

Stopped_early = 0                                   # counts bettors who lose everything
broke = 0

n = 0
while n < bettors:
    path, stopped = martingale_bettor(start, base_wager, rounds)                #find the path nd how many left early
    ax.plot(path, color=cm.turbo(n / bettors), linewidth=0.6, alpha=0.6)

    #counting who leaves because they hit 0 funds is redundant now, subset of people who leave, enough to count stopped_early only, but lets keep it to see if someone hits exactly 0
    if path[-1] <= 0:                       # last item in the list is the final funds
        broke += 1                          #increase broke ppl count

    #counts who leaves early
    if stopped:
        Stopped_early +=1

    n += 1                                  #increase iteration count


#labels
ax.set_xlabel('Number of bets')
ax.set_ylabel('Wealth')
ax.yaxis.set_major_formatter(FuncFormatter(lambda v, pos: f'{int(v):,}'))

ax.grid(True, color='gray', alpha=0.3, linestyle='--')
ax.axhline(start, color='white', linewidth=1, linestyle=':', label='Starting funds')
ax.legend()
ax.spines['top'].set_visible(False)
ax.spines['right'].set_visible(False)

ax.set_title(str(Stopped_early) + ' of ' + str(bettors) + ' stopped early, ' + str(broke) + ' hit zero')
plt.show()