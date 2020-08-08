import pandas as pd
import xlrd

df = pd.read_excel('dictionary.xlsx')

out = df['字詞名']
output = []
for i in range(len(out)):
    if len(out[i]) <= 3:
        output.append(out[i])
#print(len(output))
#print(output)

with open('word.txt', 'w') as f:
    for word in output:
        f.write("%s\n" % word)