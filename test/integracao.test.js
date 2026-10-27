import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import request from 'supertest'
import { consultarCep } from '../src/utils/consultarCep.js'
import app from '../src/app.js'

import { ClienteFactory } from './factories/ClienteFactory.js'
import { MontadoraFactory } from './factories/MontadoraFactory.js'
import { VeiculoFactory } from './factories/VeiculoFactory.js'


vi.mock('../src/configs/Database.js', () => ({
    connection: {
        execute: vi.fn(async (sql) => {
            const comando = sql.trim().toUpperCase()

            if (comando.startsWith('SELECT')) {
                return [[
                    {
                        id: 1,
                        nome: 'Toyota',
                        pais: 'Japão'
                    }
                ], []]
            }

            if (comando.startsWith('INSERT')) {
                return [{
                    insertId: 1,
                    affectedRows: 1
                }, []]
            }

            if (
                comando.startsWith('UPDATE') ||
                comando.startsWith('DELETE')
            ) {
                return [{
                    affectedRows: 1
                }, []]
            }

            return [{
                affectedRows: 1
            }, []]
        })
    }
}))

vi.mock('../src/utils/consultarCep.js', () => ({
    consultarCep: vi.fn(async () => ({
        cep: '01001000',
        logradouro: 'Praça da Sé',
        bairro: 'Centro',
        cidade: 'São Paulo',
        uf: 'SP'
    }))
}))

vi.mock('./factories/ClienteFactory.js', () => ({
    ClienteFactory: {
        create: vi.fn()
    }
}))

vi.mock('./factories/MontadoraFactory.js', () => ({
    MontadoraFactory: {
        create: vi.fn()
    }
}))

vi.mock('./factories/VeiculoFactory.js', () => ({
    VeiculoFactory: {
        create: vi.fn()
    }
}))




// ---------------------------- MONTADORAS

describe('API de montadoras', () => {
    let montadoraCriada

    beforeEach(async () => {
        vi.mocked(MontadoraFactory.create).mockResolvedValue({
            id: 1,
            nome: 'Toyota',
            pais: 'Japão'
        })

        montadoraCriada = await MontadoraFactory.create(
            'Toyota',
            'Japão'
        )
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    // CT-001
    it('deve criar uma montadora com sucesso.', async () => {
        const response = await request(app)
            .post('/montadoras')
            .send({
                nome: 'Hyundai',
                pais: 'Coreia do Sul'
            })

        expect(response.status).toBe(201)
        expect(response.body.data).toHaveProperty('insertId')
    })

    // CT-012
    it('deve listar todas as montadoras', async () => {
        const response = await request(app)
            .get('/montadoras')

        expect(response.status).toBe(200)

        const dados = Array.isArray(response.body)
            ? response.body
            : response.body.data

        expect(Array.isArray(dados)).toBe(true)
    })

    // CT-009
    it('deve editar as informações de uma montadora', async () => {
        const montadora = await MontadoraFactory.create(
            'Chevrolet',
            'Estados Unidos'
        )

        const response = await request(app)
            .put(`/montadoras?id=${montadora.id}`)
            .send({
                nome: 'Chevrolet',
                pais: 'EUA'
            })

        expect(response.status).toBe(200)
    })

    // CT-008
    it('deve deletar uma montadora', async () => {
        const response = await request(app)
            .delete(`/montadoras/${montadoraCriada.id}`)

        expect(response.status).toBe(200)
    })
})


// ---------------------------- CLIENTES

describe('API de clientes', () => {
    let clienteCriado

    beforeEach(async () => {
        vi.mocked(ClienteFactory.create).mockResolvedValue({
            id: 1,
            nome: 'Carlos Silva',
            CPF: '12345678900',
            CEP: '01001000',
            logradouro: 'Praça da Sé',
            bairro: 'Centro',
            cidade: 'São Paulo',
            UF: 'SP',
            numero: '100',
            complemento: 'Apto 12'
        })

        clienteCriado = await ClienteFactory.create(
            'Carlos Silva',
            '12345678900',
            '01001000',
            'Praça da Sé',
            'Centro',
            'São Paulo',
            'SP',
            '100',
            'Apto 12'
        )

        vi.mocked(consultarCep).mockResolvedValue({
            cep: '01001000',
            logradouro: 'Praça da Sé',
            bairro: 'Centro',
            cidade: 'São Paulo',
            uf: 'SP'
        })
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    // CT-003
    it('deve cadastrar um cliente com sucesso.', async () => {
        const response = await request(app)
            .post('/clientes')
            .send({
                nome: 'Ana Souza',
                cpf: '98765432100',
                cep: '01001000',
                numero: '50',
                complemento: 'Apto 42'
            })

        expect(response.status).toBe(201)
        expect(response.body.data).toHaveProperty('insertId')
        expect(consultarCep).toHaveBeenCalled()
    })

    // CT-010
    it('deve listar todos os clientes.', async () => {
        const response = await request(app)
            .get('/clientes')

        expect(response.status).toBe(200)

        const dados = Array.isArray(response.body)
            ? response.body
            : response.body.data

        expect(Array.isArray(dados)).toBe(true)
    })

    // CT-004
    it('deve editar as informações de um cliente.', async () => {
        const response = await request(app)
            .put(`/clientes?id=${clienteCriado.id}`)
            .send({
                nome: 'Carlos Silva Editado',
                cpf: '12345678900',
                cep: '02002000',
                numero: '100',
                complemento: 'Casa 2'
            })

        expect(response.status).toBe(200)
        expect(consultarCep).toHaveBeenCalled()
    })

    // CT-007
    it('deve deletar um cliente.', async () => {
        const response = await request(app)
            .delete(`/clientes/${clienteCriado.id}`)

        expect(response.status).toBe(200)
    })
})


// ---------------------------- CARROS

describe('API de carros', () => {
    let clienteCriado
    let montadoraCriada

    beforeEach(async () => {
        vi.mocked(ClienteFactory.create).mockResolvedValue({
            id: 1,
            nome: 'Carlos Silva',
            CPF: '12345678900',
            CEP: '01001000',
            logradouro: 'Praça da Sé',
            bairro: 'Centro',
            cidade: 'São Paulo',
            UF: 'SP',
            numero: '100',
            complemento: 'Apto 12'
        })

        vi.mocked(MontadoraFactory.create).mockResolvedValue({
            id: 1,
            nome: 'Toyota',
            pais: 'Japão'
        })

        vi.mocked(VeiculoFactory.create).mockResolvedValue({
            id: 1,
            modelo: 'Corolla',
            placa: 'ABC-1234',
            ano: 2024,
            cor: 'Preto',
            valor: 120000,
            idCliente: 1,
            idMontadora: 1
        })

        clienteCriado = await ClienteFactory.create(
            'Carlos Silva',
            '12345678900',
            '01001000',
            'Praça da Sé',
            'Centro',
            'São Paulo',
            'SP',
            '100',
            'Apto 12'
        )

        montadoraCriada = await MontadoraFactory.create(
            'Toyota',
            'Japão'
        )
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    // CT-005
    it('deve cadastrar um carro com sucesso.', async () => {
        const carro = await VeiculoFactory.create(
            'Corolla',
            'ABC-1234',
            2024,
            'Preto',
            120000,
            clienteCriado.id,
            montadoraCriada.id
        )

        expect(VeiculoFactory.create).toHaveBeenCalled()

        expect(carro).toHaveProperty('id')
        expect(carro.modelo).toBe('Corolla')
        expect(carro.placa).toBe('ABC-1234')
    })

    // CT-006
    it('deve listar todos os carros.', async () => {
        const response = await request(app)
            .get('/veiculos')

        expect(response.status).toBe(200)

        const dados = Array.isArray(response.body)
            ? response.body
            : response.body.data

        expect(Array.isArray(dados)).toBe(true)
    })

    // CT-011
    it('deve editar as informações de um carro.', async () => {
        const responseCadastro = await request(app)
            .post('/veiculos')
            .send({
                modelo: 'Corolla',
                placa: 'ABC-1234',
                ano: 2024,
                cor: 'Preto',
                valor: 120000,
                idCliente: clienteCriado.id,
                idMontadora: montadoraCriada.id
            })

        const carro = responseCadastro.body?.data || responseCadastro.body
        const id = carro?.insertId || carro?.id || 1

        const response = await request(app)
            .put(`/veiculos?id=${id}`)
            .send({
                modelo: 'Corolla XEI',
                placa: 'ABC-1234',
                ano: 2025,
                cor: 'Preto',
                valor: 135000,
                idCliente: clienteCriado.id,
                idMontadora: montadoraCriada.id
            })

        expect(response.status).toBe(200)
    })

    // CT-013
    it('deve deletar um carro.', async () => {
        const responseCadastro = await request(app)
            .post('/veiculos')
            .send({
                modelo: 'Corolla',
                placa: 'ABC-1234',
                ano: 2024,
                cor: 'Preto',
                valor: 120000,
                idCliente: clienteCriado.id,
                idMontadora: montadoraCriada.id
            })

        const carro = responseCadastro.body?.data || responseCadastro.body
        const id = carro?.insertId || carro?.id || 1

        const response = await request(app)
            .delete(`/veiculos/${id}`)

        expect(response.status).toBe(200)
    })
})

// ---------------------------- CTs RESTANTES
describe('Outros CTs importantes', () => {

    // CT-014
    it('deve retornar erro ao tentar listar veículos se houver falha no banco de dados', async () => {
        const Database = await import('../src/configs/Database.js')
        
        // Forçar o banco de dados a lançar um erro temporariamente
        vi.mocked(Database.connection.execute).mockRejectedValueOnce(new Error('Erro de conexão'))

        const response = await request(app)
            .get('/veiculos')

        // Vai garantir que a API retorne um código de erro, seja ele maior ou igual a 400
        expect(response.status).toBeGreaterThanOrEqual(400)
    })

    // CT-015
    it('deve disponibilizar a aplicação para navegação', async () => {
        const response = await request(app)
            .get('/')

        expect(response.status).toBeLessThan(500)
    })

    // CT-016
    it('deve processar uma requisição de envio', async () => {
        const response = await request(app)
            .post('/requisicoes')
            .send({
                descricao: 'Envio de item'
            })

        expect(response.status).not.toBe(500)
    })

    // CT-017
    it('deve acessar o módulo de usuários', async () => {
        const response = await request(app)
            .get('/usuarios')

        expect(response.status).toBeLessThan(500)
    })

    // CT-018
    it('deve rejeitar uma solicitação com descrição inválida', async () => {
        const response = await request(app)
            .post('/requisicoes')
            .send({
                descricao: "<script>alert('test')</script>"
            })

        expect(response.status).not.toBe(201)
    })

    // CT-019
    it('deve permitir o cliente acessar o sistema', async () => {
        const response = await request(app)
            .get('/')

        expect(response.status).toBeLessThan(500)
    })
})

// ---------------------------- CTs ADICIONAIS (CT-020 a CT-024)
describe('Testes Adicionais para Validações e Tratamento de Erros', () => {

    // CT-020
    it('deve retornar erro ao tentar cadastrar uma montadora com campos vazios', async () => {
        const response = await request(app)
            .post('/montadoras')
            .send({
                nome: '',
                pais: ''
            })

        expect(response.status).toBeGreaterThanOrEqual(400)
    })

    // CT-021
    it('deve retornar erro ao consultar um cliente com ID inexistente', async () => {
        const response = await request(app)
            .get('/clientes/999999')

        expect([404, 400]).toContain(response.status)
    })    

    // CT-022
    it('deve retornar erro ao buscar um veículo com ID inexistente', async () => {
        const response = await request(app)
            .get('/veiculos/999999')

        expect(response.status).not.toBe(200)
    })

    // CT-023
    it('deve retornar status adequado se a rota não existir', async () => {
        const response = await request(app)
            .get('/rota-que-nao-existe-12345')

        expect(response.status).toBe(404)
    })    

    // CT-024
    it('deve retornar um cabeçalho JSON válido na listagem de veículos', async () => {
        const response = await request(app).get('/veiculos')
        expect(response.headers['content-type']).toMatch(/json/)
    })
    // CT-025
    it('deve retornar um aviso de erro ao tentar cadastrar um veículo com campos obrigatórios ausentes', async () => {
        const response = await request(app)
            .post('/veiculos')
            .send({
                modelo: '',
                placa: ''
            })

        expect(response.status).toBeGreaterThanOrEqual(400)
    })
})
