import json,re,sys
W="/mnt/project-files/web/content/es/"
LET="A-Za-zÁÉÍÓÚÜÑáéíóúüñÄÖÜäößÀÈÌÒÙàèìòùç"
RE=re.compile(r"\[([^\]|]+)(?:\|([^\]]+))?\]|(["+LET+"0-9]+)")
d=json.load(open(W+"definiciones.json"));t=json.load(open(W+"traducciones-en.json"))
miss={}
for id in sys.argv[1:]:
    L=json.load(open(W+"lecturas/"+id+".json"))
    S=list(L["text"])
    for q in L["q"]: S+= [q[0]]+q[1]
    for h in L["halves"]: S+=h
    for g in L["grammar"]["items"]: S+=[g[0]]+g[1]
    S+=[v[0] for v in L["vocab"]]
    for s in S:
        for m in RE.finditer(s):
            k=(m.group(2) or m.group(1) or m.group(3)).lower()
            if k.isdigit(): continue
            if k not in d or k not in t: miss.setdefault(k,id)
for k,v in sorted(miss.items()): print(k)
print(len(miss),file=sys.stderr)
