import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

const PURPLE = '#6c63ff';

export default function CadastroScreen() {}


const styles = StyleSheet.create({
    container : {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    card : {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 28,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.20,
        shadowRadius: 10,
        elevation: 8,
    },
    iconeContainer : {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: '#ede9fe', 
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center',
    },
    titulo : {
         marginTop: 16,
        fontSize: 26,
        fontWeight: 'bold',
        color: '#1a1a2e',
        textAlign: 'center',
    },
    subtitulo : {
        fontSize: 14,
        color: '#888888',
        textAlign: 'center',
        marginTop: 2,
        marginBottom: 24,
    },
    label : {
        fontSize: 13,
        fontWeight: '500',
        marginBottom: 5,
        color: '#555555',
    },
    InputContainer : {
        height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    paddingHorizontal: 10,
    marginTop: 8,
    },
    inputIcon : {},
    input : {flex: 1, 
        marginLeft: 10, 
        fontSize: 15, 
        color: '#1E293B',
    },
    botaoEntrar : {
        height: 56, 
        marginTop: 8, 
        marginBottom: 16, 
        backgroundColor: PURPLE, 
        borderRadius: 10, 
        alignItems: 'center',
         justifyContent: 'center',
        },
    botaoTexto : {
        color: '#FFFFFF', 
        fontSize: 16, 
        fontWeight: 'bold',
    },
    keyboard : {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scroll : {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,    
    },
    cadastroContainer : {
        flexDirection: 'row', 
        justifyContent: 'center', 
        alignItems: 'center',
    },
    cadastroTexto : {
        fontSize: 14, 
        color: '#888888',
    },
    linkCadastro : {
        marginLeft: 4, 
        fontSize: 14, 
        color: PURPLE, 
        fontWeight: 'bold',
    },
})
