import pandas as pd
import xlrd

'''
df = pd.read_excel('hard.xlsx')

out = df['字詞名']
output = ['1']
for i in range(len(out)):
    if len(out[i]) <= 3:
        output.append(out[i])
#print(len(output))
#print(output)

with open('word.txt', 'w') as f:
    for word in output:
        f.write("%s\n" % word)
'''

df = pd.read_excel('simple.xlsx')
print(df)

out = df['名詞']
output = ['1']
for i in range(len(df)):
    output.append(out[i])
print(output)

with open('simple.txt', 'w') as f:
    for word in output:
        f.write("%s\n" % word)