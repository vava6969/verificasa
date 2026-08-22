import io, sys
def sub(path, old, new, n=1):
    s=io.open(path,encoding="utf-8").read()
    if s.count(old)!=n: sys.exit("BAD (%d) %s: %s"%(s.count(old),path,old[:130]))
    io.open(path,"w",encoding="utf-8",newline="\n").write(s.replace(old,new))

S="base44/shared/boosts.js"
sub(S, "export const BOOST_DURATION_DAYS = 7;",
"""// Boost-urile NU expir\u0103 (decizia clientului, 22.08). Data r\u0103m\u00e2ne scris\u0103 doar
// pentru c\u0103 Boost.ends_date e obligatoriu \u00een schem\u0103; nimeni nu o mai cite\u0219te.
// Se pune departe \u00een viitor, ca un ExpireBoosts vechi r\u0103mas \u00een cron s\u0103 nu
// sting\u0103 nimic dac\u0103 ruleaz\u0103 \u00eenainte s\u0103 fie redeployat.
export const BOOST_NEVER_ENDS = "2999-12-31T23:59:59.000Z";""")

A="base44/functions/ApplyBoost/entry.ts"
sub(A, 'import { getBalance, addCredits, BOOST_DURATION_DAYS } from "../../shared/boosts.js";',
       'import { getBalance, addCredits, BOOST_NEVER_ENDS } from "../../shared/boosts.js";')
print("shared ok")
