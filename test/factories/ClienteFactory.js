import { connection } from "../../src/configs/Database.js";

export class ClienteFactory {
    static async create (
        nome, 
        cpf, 
        cep, 
        logradouro, 
        bairro, 
        cidade, 
        uf,
        numero,
        complemento
    ) {
        const [result] = await connection.execute(
            `INSERT INTO clientes (Nome, CPF, CEP, Logradouro, Bairro, Cidade, UF, Numero, Complemento) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`, 
            [nome, cpf, cep, logradouro, bairro, cidade, uf, numero, complemento]
        );

        return {
            id: result.insertId,
            nome,
            cpf,
            cep,
            logradouro,
            bairro,
            cidade,
            uf,
            numero,
            complemento
        };
    }
}