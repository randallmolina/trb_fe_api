import os 
import pyjasper

def advanced_example_using_database():
    input_file = os.path.dirname(os.path.abspath(__file__)) + \
                 '/definicion/trb_rep_doc_factura.jrxml'
    output = os.path.dirname(os.path.abspath(__file__)) + '/output/examples'
    print(output + '.pdf')

    con = {
        'driver': 'postgres',
        'username': 'postgres',
        'password': 'exdesa',
        'host': '192.190.42.116',
        'database': 'trb_bd', 
        'port': 5432
    }
    #print(con + ':con')

    jasper = pyjasper.JasperPy()
    jasper.process(
        input_file,
        output=output,
        format_list=["pdf"],   # , "rtf", "xml"
        parameters={'P_EMPRESA':15,'P_ID_DOCUMENTO':155},
        db_connection=con,
        locale='en_US'  # LOCALE Ex.:(en_US, de_GE)
    )
    print(output + '.pdf')

advanced_example_using_database()
print('Result is the file below.')