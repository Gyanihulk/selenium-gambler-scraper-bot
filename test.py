from selenium import webdriver 
from selenium.webdriver.common.by import By
import PySimpleGUI as sg
import datetime
import time
import telebot



# Data de expiração da licença (ano, mês, dia)
data_expiracao = datetime.date(2024, 12, 31)

# Obtém a data atual
data_atual = datetime.date.today()

# Verifica se a licença está expirada
if data_atual >= data_expiracao:
    print("A licença expirou. Entre em contato com o suporte.")
else:
   
    driver = webdriver.Chrome()

    driver.get("https://blaze-7.com/pt/games/bac-bo")

    window_before = driver.window_handles[0]


    while len(driver.find_elements(By.XPATH, '/html/body/div[1]/main/div[1]/div[2]/div/div[2]/div/div[2]/div/div/div[1]')) == 0:
        time.sleep(2)


    layout_login = [
            [sg.Text('Usuário:'), sg.InputText()],
            [sg.Text('Senha:  '), sg.InputText(password_char='*')],
            [sg.Button('Login'), sg.Button('Cancelar')]
        ]


    janela_login = sg.Window('Login').Layout(layout_login)

    while True:
        evento, valores = janela_login.Read()
        if evento == sg.WINDOW_CLOSED or evento == 'Cancelar':
            break
        usuario = valores[0]
        senha = valores[1]

        janela_login.hide()

        driver.find_element(By.XPATH, '/html/body/div[1]/main/div[1]/div[2]/div/div[2]/div/div[2]/div/div/div[1]').click()

        while len(driver.find_elements(By.XPATH, '/html/body/div[1]/main/div[3]/div/div[2]/div/form/div[1]/div/input')) == 0:
            time.sleep(2)
            
        driver.find_element(By.XPATH, '/html/body/div[1]/main/div[3]/div/div[2]/div/form/div[1]/div/input').send_keys(usuario)
                                
        driver.find_element(By.XPATH, '/html/body/div[1]/main/div[3]/div/div[2]/div/form/div[2]/div/input').send_keys(senha)

        driver.find_element(By.XPATH, '/html/body/div[1]/main/div[3]/div/div[2]/div/form/div[4]/button').click()
        
        time.sleep(5)

        elemento = driver.find_elements(By.XPATH, '/html/body/div[1]/main/div[1]/div[2]/div/div[2]/div/div[2]/div/div[3]/div/a/div/div/div[1]')
    ###################################################################################

        if len(elemento) != 0:

            sg.Popup('Login bem sucedido!')


            layout = [
                
                [sg.Text('DIGITE OS PADROES: '), sg.Multiline(default_text='', size=(40, 5))],                          
                [sg.Text('DIGITE UM NUMERO DE GALES: '), sg.InputText()],                   
                # [sg.Text('DIGITE O TOKEN DO BOT: '), sg.InputText()],   
                # [sg.Text('DIGITE O ID DO CANAL: '), sg.InputText()],                                  
                [sg.Button('OK'), sg.Button('Cancelar')]
            
            ]
            


            janela = sg.Window('Minha Interface').Layout(layout)


            while True:
                evento, valores = janela.Read()
                if evento == sg.WINDOW_CLOSED or evento == 'Cancelar':
                    break
                
                limite = str(valores[0]).split()                  
                quantidade_gale = int(valores[1])                
                api_key = '7015118785:AAGBNaFVyGkEPz-F3FPULCe8OSu-9Li5wHY'
                chat_id = '-1002023064521'
                
                janela.hide()
                
                #####################################

                bot = telebot.TeleBot(token=api_key)

                ################################
                analisando = True 
                fake_analisando = False 
                entrada = False           
                gale = False             
                green = False                
                gale = False             
                green = False     

                rodadas = 0

                quantidade = 0   
                
                aposta = None  
                p = None 
                msg_id = None 
                
                greens = 0
                losses = 0
                empate = 0       
                cons = 0   
                
                ####################################################################################
                apaga_gale = False               
                total_vitorias = None
                total_jogos = None
                porcentagem_assertividade = None
                ########################################################################################         
                
                CORES_LISTA = None

                CHECK_CORES = None

                resultado_recente = None                        
                
                
                
                #FUNÇÕES            
               #################################################################################  
               
               
                  
                def resolvendo_problema_inatividade():
        
                    driver.get("https://blaze-6.com/pt/games/bac-bo")
                    
                    time.sleep(10)
                    
                    return 
                
               
                ###############################################################
    
                def api():

                    global resultado_recente
                    global CORES_LISTA

                    driver.switch_to.window(window_before)

                    # while len(driver.find_elements(By.XPATH, '/html/body/div[1]/p/main/div[1]/div[4]/div/div[1]/div/div[1]/div[1]/div/iframe')) == 0:
                    #     time.sleep(2)

                    iframe1 = driver.find_element(By.XPATH, '/html/body/div[1]/main/div[1]/div[4]/div/div[1]/div/div[1]/div[1]/div/iframe')

                    driver.switch_to.frame(iframe1)

                    # #######################################################################################

                    # while len(driver.find_elements(By.XPATH, '/html/body/div[5]/div[2]/iframe')) == 0:
                    #     time.sleep(2)

                    iframe2 = driver.find_element(By.XPATH, '/html/body/div[5]/div[2]/iframe')

                    driver.switch_to.frame(iframe2)

                    ########################################################################################                
                        
                    # while len(driver.find_elements(By.CLASS_NAME, 'derivedRoadsText--6e552')) == 0:
                    #     time.sleep(2)
                        
                    resultado  = driver.find_elements(By.CLASS_NAME, 'derivedRoadsText--6e552')                              
                    
                    resultado_recente = []

                    for x in range(len(resultado)):
                        c = resultado[x].text
                        resultado_recente.append(c)

                    resultado = resultado_recente[::-1][0:11]
                    
                    CORES_LISTA = []

                    for i in resultado:
                        if i == 'P':
                            CORES_LISTA.append('P')
                        if i == 'T':
                            CORES_LISTA.append('E')
                        if i == 'B':
                            CORES_LISTA.append('B')
                

                    return CORES_LISTA             

                    
                                        
                
                #################################################################            
                
               
            

                def estrategia(result):
                    
                    global analisando
                    global fake_analisando
                    global entrada                    
                    global green
                    global gale
                    global red
                    global quantidade
                    global quantidade_gale
                    global limite 
                    global aposta
                    global p
                    global msg_id
                    global greens 
                    global losses 
                    global empate 
                    global cons
                    global apaga_gale
                    global total_vitorias
                    global total_vitorias
                    global porcentagem_assertividade
                               
                    
                    
                    if analisando == True:
                        
                        for x in limite:
                            
                            
                            partes = x.strip().split('=')
                            padrao_ = partes[0].strip()
                            aposta = partes[1].strip()                           
                            
                        
                            p = list(padrao_)    
                            
                            remove = p[1:]
                            
                            if result[0:len(remove)] == remove:
                                
                                msg_id = bot.send_message(chat_id=chat_id, text=f'⚠️ ANALISANDO, FIQUE ATENTO!!!').message_id
                                
                                analisando = False 
                                fake_analisando = True 
                                entrada = True 
                               
                                break                            
                        return         
                    
                    elif result[0] != p[0] and fake_analisando == True:
                        
                        print('FALSO ALERTA!!')
                        
                        bot.delete_message(chat_id=chat_id, message_id=msg_id)
                        
                        analisando = True
                        fake_analisando = False 
                        entrada = False 
                        return 
                            
                    elif result[0:len(p)] == p and entrada == True:
                        
                        if aposta == 'E':
                            aposta_ = 'EMPATE'
                            
                        elif aposta == 'P':
                            aposta_ = 'AZUL'
                            
                        elif aposta == 'B':
                            aposta_ = 'VERMELHO'
                        
                        bot.delete_message(chat_id=chat_id, message_id=msg_id)
                        
                        bot.send_message(chat_id=chat_id, text=f'''

✅*ENTRADA CONFIRMADA!*
🎲 Entrar no: {aposta_}
🟡 Proteger o empate (Meio) 
🎯 Fazer até {quantidade_gale} Gales!''')
                        
                        print(f'Padrão {p}')                       
                        
                        green = True 
                        gale = True 
                        entrada = False  
                        fake_analisando = False 
                        return       
                               
                    
                    elif result[0] == aposta and green == True:
                        
                                               
                        greens+=1 
                        cons+=1 
                        
                        total_vitorias = greens
                        total_jogos = total_vitorias + losses
                        porcentagem_assertividade = (total_vitorias / total_jogos) * 100
                        
                        if apaga_gale == True:
                            bot.delete_message(chat_id=chat_id, message_id=msg_id)
                            apaga_gale = False 
                        
                        bot.send_message(chat_id=chat_id, text=f'✅✅✅ GREEN ✅✅✅')
                        
                        bot.send_message(chat_id=chat_id, text=f'''

PLACAR GERAL 
✅{greens} 
🟡{empate} 
🚫{losses} 
Consecutivas = {cons}
Assertividade = {porcentagem_assertividade}%
    
    ''')
                        
                        quantidade = 0
                        
                        green = False 
                        gale = False
                        red = False                       
                        analisando = True                        
                        
                        return 
                    
                    elif result[0] == 'E' and green == True:
                        
                        empate+=1 
                        greens+=1 
                        cons+=1  
                        
                        total_vitorias = greens 
                        total_jogos = total_vitorias + losses
                        porcentagem_assertividade = (total_vitorias / total_jogos) * 100                       
                        
                        if apaga_gale == True:
                            bot.delete_message(chat_id=chat_id, message_id=msg_id)
                            apaga_gale = False 
                        
                        bot.send_message(chat_id=chat_id, text=f'✅✅✅ EMPATE 🟡🟡🟡')
                        
                        bot.send_message(chat_id=chat_id, text=f'''

PLACAR GERAL 
✅{greens} 
🟡{empate} 
🚫{losses} 
Consecutivas = {cons}
Assertividade = {porcentagem_assertividade}%
    
    ''')
                        
                        quantidade = 0
                        
                        green = False 
                        gale = False
                        red = False                       
                        analisando = True                        
                        
                        return 
                    
                    elif result[0] != aposta and gale == True and quantidade < quantidade_gale:
                        
                        quantidade+=1
                        
                        if apaga_gale == True:
                            bot.delete_message(chat_id=chat_id, message_id=msg_id)
                                               
                        if quantidade == quantidade_gale:
                            red = True 
                        
                        apaga_gale = True 
                        
                        msg_id = bot.send_message(chat_id=chat_id, text=f'⚠️ Vamos para o {quantidade}ª GALE').message_id
                        
                        
                        return 
                    
                    elif (result[0] != aposta and result[0] != 'E') and red == True:
                        
                        losses+=1 
                        cons = 0
                        
                        total_vitorias = greens
                        total_jogos = total_vitorias + losses
                        porcentagem_assertividade = (total_vitorias / total_jogos) * 100
                        
                        if apaga_gale == True:
                            bot.delete_message(chat_id=chat_id, message_id=msg_id)
                            apaga_gale = False 
                        
                        bot.send_message(chat_id=chat_id, text=f'🚫🚫🚫 LOSS 🚫🚫🚫')
                        
                        bot.send_message(chat_id=chat_id, text=f'''

PLACAR GERAL 
✅{greens} 
🟡{empate} 
🚫{losses} 
Consecutivas = {cons}
Assertividade = {porcentagem_assertividade}%
    
    ''')
                        
                        quantidade = 0
                        
                        green = False 
                        gale = False
                        red = False                         
                        analisando = True                       
                        
                        return
        

                ###############################################################     
                
                
                while True:         
                  
                       
                    try:
                        api()    
                        
                        if rodadas == 10:
                            
                            resolvendo_problema_inatividade()   
                            rodadas = 0                    
                            
                        

                        if CORES_LISTA != CHECK_CORES:
                            CHECK_CORES = CORES_LISTA                                           
                            
                            
                            print(CORES_LISTA)                                                
                            
                            print('___________________')
                            
                            estrategia(CORES_LISTA)   
                            
                            rodadas+=1 
                                                    
                    except:
                        
                       print('ANALISANDO')
        else:
            sg.Popup('Usuário ou senha inválidos. Tente novamente.')


    janela_login.close()
    janela.close()



