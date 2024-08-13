import pandas as pd
import statsmodels.api as sm
from statsmodels.formula.api import ols
from statsmodels.stats.multicomp import MultiComparison
from scipy import stats

def describe_data(data):
    return data.describe().to_dict()

def anova_analysis(data):
    model = ols('leaf_weight ~ LED', data=data).fit()
    anova_table = sm.stats.anova_lm(model, typ=2)
    return anova_table.to_dict()

def tukey_test(data):
    mc = MultiComparison(data['leaf_weight'], data['LED'])
    result = mc.tukeyhsd()
    return result.summary().as_html()

def t_test(data):
    mc = MultiComparison(data['leaf_weight'], data['LED'])
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

def read_excel_file(file):
    try:
        # Đọc dữ liệu từ tệp Excel
        data = pd.read_excel(file)
        # Chuyển dữ liệu thành danh sách các dictionaries
        data_list = data.to_dict(orient='records')
        return data_list
    except Exception as e:
        # Trả về thông báo lỗi nếu có vấn đề khi đọc tệp
        return {"error": str(e)}

