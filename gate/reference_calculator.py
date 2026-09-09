#!/usr/bin/env python3
"""Independent synthetic reference gate. Application code must never import this file."""
from __future__ import annotations
import argparse, sys

TOLERANCE=.005
ALPINE_2025=dict(gross_receipts=4_200_000,cogs=2_750_000,operating_expense_excl_dna_interest_comp=640_000,officer_compensation=180_000,depreciation=95_000,amortization=10_000,interest_expense=62_000,section_179=40_000,k1_distribution=300_000)
ALPINE_2024=dict(gross_receipts=3_900_000,cogs=2_570_000,operating_expense_excl_dna_interest_comp=607_000,officer_compensation=175_000,depreciation=90_000,amortization=10_000,interest_expense=58_000,section_179=0,k1_distribution=280_000)
ALPINE_EXISTING_DEBT=dict(cpltd_annual=58_000,operating_lease_annual=24_000)
ALPINE_PROPOSED_LOAN=dict(amount=500_000,annual_rate=.105,term_months=120)
ALPINE_GUARANTOR=dict(wages=65_000,interest_dividend_income=3_000,mortgage_pi_annual=28_800,auto_loan_annual=7_200,credit_card_min_annual=3_600)
ALPINE_WORKING_CAPITAL=dict(ar_increase=140_000,inventory_increase=60_000,ap_increase=50_000,cash_taxes_paid=95_000)
BRISTLECONE_2025=dict(gross_receipts=2_200_000,cogs=1_850_000,operating_expense_excl_dna_interest_comp=180_000,officer_compensation=60_000,depreciation=40_000,amortization=5_000,interest_expense=48_000,section_179=0,k1_distribution=90_000)
BRISTLECONE_EXISTING_DEBT=dict(cpltd_annual=45_000,operating_lease_annual=18_000)
BRISTLECONE_PROPOSED_LOAN=dict(amount=350_000,annual_rate=.115,term_months=120)
BRISTLECONE_GUARANTOR=dict(wages=42_000,interest_dividend_income=500,mortgage_pi_annual=24_000,auto_loan_annual=6_000,credit_card_min_annual=4_800)
BRISTLECONE_WORKING_CAPITAL=dict(ar_increase=10_000,inventory_increase=5_000,ap_increase=8_000,cash_taxes_paid=15_000)
CONSUMER_C=dict(gross_monthly_income=9000,proposed_housing_pi=2200,proposed_housing_tax_ins=470,other_monthly_debt=1200)
EXPECTED=dict(alpine_obi_2025=423000.,alpine_obi_2024=390000.,alpine_ebitda_2025=630000.,alpine_ebitda_2024=548000.,alpine_proposed_debt_service=80961.,alpine_dscr=3.135,alpine_fccr=2.800,alpine_global_dscr=2.902,alpine_uca_cash_flow=385000.,bristlecone_obi=17000.,bristlecone_ebitda=110000.,bristlecone_proposed_debt_service=59050.09,bristlecone_dscr=.723,bristlecone_fccr=.647,bristlecone_global_dscr=.816,bristlecone_uca_cash_flow=88000.,consumer_c_front_dti=.2967,consumer_c_back_dti=.4300)
EXPECTED_FLAGS=dict(alpine_k1_history_flag='stable',bristlecone_k1_history_flag='insufficient_history')

def obi(y): return y['gross_receipts']-y['cogs']-y['operating_expense_excl_dna_interest_comp']-y['officer_compensation']-y['depreciation']-y['amortization']-y['interest_expense']-y.get('section_179',0)
def ebitda(y): return obi(y)+y['interest_expense']+y['depreciation']+y['amortization']+y.get('section_179',0)
def ads(p,r,n):
    m=r/12
    return p*m/(1-(1+m)**-n)*12
def loan(x): return {**x,'debt_service':ads(x['amount'],x['annual_rate'],x['term_months'])}
def dscr(y,d,l): return ebitda(y)/(y['interest_expense']+d['cpltd_annual']+l['debt_service'])
def fccr(y,d,l): return ebitda(y)/(y['interest_expense']+d['cpltd_annual']+l['debt_service']+d['operating_lease_annual'])
def global_dscr(y,d,l,g):
    t=y['interest_expense']+d['cpltd_annual']+l['debt_service']+g['mortgage_pi_annual']+g['auto_loan_annual']+g['credit_card_min_annual']
    return (ebitda(y)+g['wages']+g['interest_dividend_income'])/t
def uca(y,w): return ebitda(y)-w['cash_taxes_paid']-(w['ar_increase']+w['inventory_increase']-w['ap_increase'])
def k1ratio(y): return float('inf') if obi(y)<=0 else y['k1_distribution']/obi(y)
def k1flag(ys,band=.15):
    if len(ys)<2:return 'insufficient_history'
    a,b=map(k1ratio,ys[-2:]); return 'stable' if abs(a-b)<=band else 'unstable'
def dti(a):
    h=a['proposed_housing_pi']+a['proposed_housing_tax_ins']; return h/a['gross_monthly_income'],(h+a['other_monthly_debt'])/a['gross_monthly_income']

def checks():
    al,bl=loan(ALPINE_PROPOSED_LOAN),loan(BRISTLECONE_PROPOSED_LOAN); f,b=dti(CONSUMER_C)
    return dict(alpine_obi_2025=obi(ALPINE_2025),alpine_obi_2024=obi(ALPINE_2024),alpine_ebitda_2025=ebitda(ALPINE_2025),alpine_ebitda_2024=ebitda(ALPINE_2024),alpine_proposed_debt_service=al['debt_service'],alpine_dscr=dscr(ALPINE_2025,ALPINE_EXISTING_DEBT,al),alpine_fccr=fccr(ALPINE_2025,ALPINE_EXISTING_DEBT,al),alpine_global_dscr=global_dscr(ALPINE_2025,ALPINE_EXISTING_DEBT,al,ALPINE_GUARANTOR),alpine_uca_cash_flow=uca(ALPINE_2025,ALPINE_WORKING_CAPITAL),bristlecone_obi=obi(BRISTLECONE_2025),bristlecone_ebitda=ebitda(BRISTLECONE_2025),bristlecone_proposed_debt_service=bl['debt_service'],bristlecone_dscr=dscr(BRISTLECONE_2025,BRISTLECONE_EXISTING_DEBT,bl),bristlecone_fccr=fccr(BRISTLECONE_2025,BRISTLECONE_EXISTING_DEBT,bl),bristlecone_global_dscr=global_dscr(BRISTLECONE_2025,BRISTLECONE_EXISTING_DEBT,bl,BRISTLECONE_GUARANTOR),bristlecone_uca_cash_flow=uca(BRISTLECONE_2025,BRISTLECONE_WORKING_CAPITAL),consumer_c_front_dti=f,consumer_c_back_dti=b)

def mutations():
    al=loan(ALPINE_PROPOSED_LOAN)
    t=ALPINE_2025['interest_expense']+ALPINE_EXISTING_DEBT['cpltd_annual']+al['debt_service']
    personal=ALPINE_GUARANTOR['mortgage_pi_annual']+ALPINE_GUARANTOR['auto_loan_annual']+ALPINE_GUARANTOR['credit_card_min_annual']
    mf,mb=dti(CONSUMER_C)[::-1]
    return {
      'dscr_omits_addback': abs(obi(ALPINE_2025)/t-EXPECTED['alpine_dscr'])>TOLERANCE,
      'fccr_omits_lease': abs(ebitda(ALPINE_2025)/t-EXPECTED['alpine_fccr'])>TOLERANCE,
      'global_dscr_double_counts_distribution': abs((ebitda(ALPINE_2025)+ALPINE_2025['k1_distribution']+ALPINE_GUARANTOR['wages']+ALPINE_GUARANTOR['interest_dividend_income'])/(t+personal)-EXPECTED['alpine_global_dscr'])>TOLERANCE,
      'uca_omits_working_capital': abs((ebitda(ALPINE_2025)-ALPINE_WORKING_CAPITAL['cash_taxes_paid'])-EXPECTED['alpine_uca_cash_flow'])>TOLERANCE,
      'amortization_simple_interest': abs((ALPINE_PROPOSED_LOAN['amount']/(ALPINE_PROPOSED_LOAN['term_months']/12)+ALPINE_PROPOSED_LOAN['amount']*ALPINE_PROPOSED_LOAN['annual_rate'])-EXPECTED['alpine_proposed_debt_service'])>1,
      'dti_swaps_front_back': abs(mf-EXPECTED['consumer_c_front_dti'])>.0005,
      'k1_always_stable': 'stable'!=EXPECTED_FLAGS['bristlecone_k1_history_flag'],
    }

def main(argv=None):
    p=argparse.ArgumentParser(); p.add_argument('--selftest',action='store_true'); a=p.parse_args(argv)
    got=checks(); failed=[]
    for k,v in got.items():
        tol=1 if 'debt_service' in k else (.0005 if 'dti' in k else (.01 if 'obi' in k or 'ebitda' in k or 'cash_flow' in k else TOLERANCE))
        ok=abs(v-EXPECTED[k])<=tol; failed.append(not ok); print(f"{'PASS' if ok else 'FAIL'}  {k:40s} got={v:.4f}  expected={EXPECTED[k]:.4f}  tol={tol}")
    flags={'alpine_k1_history_flag':k1flag([ALPINE_2024,ALPINE_2025]),'bristlecone_k1_history_flag':k1flag([BRISTLECONE_2025])}
    for k,v in flags.items():
        ok=v==EXPECTED_FLAGS[k]; failed.append(not ok); print(f"{'PASS' if ok else 'FAIL'}  {k:40s} got={v!r:20s} expected={EXPECTED_FLAGS[k]!r}")
    if a.selftest:
        ms=mutations(); print()
        for k,v in ms.items(): print(f"{'KILLED' if v else 'SURVIVED (bad)':16s} mutation: {k}")
        if any(failed) or not all(ms.values()): print('\nSELFTEST FAIL'); return 1
        print(f"\nSELFTEST PASS: {len(got)} fixture values and {len(flags)} flags pinned correctly, all {len(ms)} mutations killed.")
    return 1 if any(failed) else 0

if __name__=='__main__': sys.exit(main())
