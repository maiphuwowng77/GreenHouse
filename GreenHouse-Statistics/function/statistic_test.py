import pandas as pd
import statsmodels.api as sm
from statsmodels.formula.api import ols
from statsmodels.stats.multicomp import MultiComparison
from scipy import stats
import json

def describe_data(data):
    data = pd.DataFrame(data)
    data['value'] = pd.to_numeric(data['value'], errors='coerce')
    
    # Group by treatment_code and describe each group
    grouped = data.groupby('treatment_code')['value'].describe()
    
    # Convert the result to dictionary
    description = grouped.to_dict()
    
    return description

def anova_analysis(data):
    data = pd.DataFrame(data)
    data['value'] = pd.to_numeric(data['value'], errors='coerce')
    model = ols('value ~ treatment_code', data=data).fit()
    anova_table = sm.stats.anova_lm(model, typ=2)

    # Convert anova_table to JSON-serializable format and handle NaN values
    result = {
        'F': {
            'Residual': 'NaN' if pd.isna(anova_table['F']['Residual']) else float(anova_table['F']['Residual']),
            'treatment_code': 'NaN' if pd.isna(anova_table['F']['treatment_code']) else float(anova_table['F']['treatment_code'])
        },
        'PR(>F)': {
            'Residual': 'NaN' if pd.isna(anova_table['PR(>F)']['Residual']) else float(anova_table['PR(>F)']['Residual']),
            'treatment_code': 'NaN' if pd.isna(anova_table['PR(>F)']['treatment_code']) else float(anova_table['PR(>F)']['treatment_code'])
        },
        'df': {
            'Residual': 'NaN' if pd.isna(anova_table['df']['Residual']) else float(anova_table['df']['Residual']),
            'treatment_code': 'NaN' if pd.isna(anova_table['df']['treatment_code']) else float(anova_table['df']['treatment_code'])
        },
        'sum_sq': {
            'Residual': 'NaN' if pd.isna(anova_table['sum_sq']['Residual']) else float(anova_table['sum_sq']['Residual']),
            'treatment_code': 'NaN' if pd.isna(anova_table['sum_sq']['treatment_code']) else float(anova_table['sum_sq']['treatment_code'])
        }
    }

    return result

def tukey_test(data):
    data = pd.DataFrame(data)
    data['value'] = pd.to_numeric(data['value'], errors='coerce')
    mc = MultiComparison(data['value'], data['treatment_code'])
    result = mc.tukeyhsd()
    return result.summary().as_html()

def t_test(data):
    data = pd.DataFrame(data)
    data['value'] = pd.to_numeric(data['value'], errors='coerce')
    mc = MultiComparison(data['value'], data['treatment_code'])
    result = mc.allpairtest(stats.ttest_ind, method='Holm')
    
    json_results = []
    for row in result[-1]:
        json_results.append({
            'group1': row[0],
            'group2': row[1],
            'stat': row[2],
            'pval': row[3],
            'pval_corr': row[4],
            'reject': bool(row[5])
        })

    return json_results

