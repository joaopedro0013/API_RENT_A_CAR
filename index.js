const express = require('express');
const fs = require('fs');
const app = express();
const port = 3000;

app.use(express.json());

// Função para leitura dos ficheiros .json
function loadData(filename) {
    const data = fs.readFileSync(`./data/${filename}`, 'utf-8');
    return JSON.parse(data);
}

// Função para guardar os ficheiros .json
function saveData(filename, data) {
    fs.writeFileSync(`./data/${filename}`, JSON.stringify(data, null, 2));
}



// GET - Listar carros
app.get('/carros', (req, res) => {
    const carros = loadData("carros.json");
    res.json(carros);
});

// POST - Adicionar carro
app.post('/carros', (req, res) => {
    const carros = loadData("carros.json");
    const novoCarro = req.body;

    novoCarro.id = carros.length + 1;
    novoCarro.disponivel = true;

    carros.push(novoCarro);
    saveData("carros.json", carros);

    res.json(novoCarro);
});



// GET - Listar clientes
app.get('/clientes', (req, res) => {
    const clientes = loadData("clientes.json");
    res.json(clientes);
});

// POST - Adicionar cliente
app.post('/clientes', (req, res) => {
    const clientes = loadData("clientes.json");
    const novoCliente = req.body;

    novoCliente.id = clientes.length + 1;

    clientes.push(novoCliente);
    saveData("clientes.json", clientes);

    res.json(novoCliente);
});



// POST - Criar reserva
app.post('/reservas', (req, res) => {
    const reservas = loadData("reservas.json");
    const carros = loadData("carros.json");
    const clientes = loadData("clientes.json");

    const { clienteId, carroId, dias } = req.body;

    // Validar cliente
    const cliente = clientes.find(c => c.id === clienteId);
    if (!cliente) return res.status(400).json({ erro: "Cliente não encontrado!" });

    // Validar carro
    const carro = carros.find(c => c.id === carroId);
    if (!carro) return res.status(400).json({ erro: "Carro não encontrado!" });

    // Verificar disponibilidade
    if (!carro.disponivel) {
        return res.status(400).json({ erro: "Carro indisponível" });
    }

    // Criar reserva
    const reserva = {
        id: reservas.length + 1,
        clienteId,
        carroId,
        dias,
        status: "ativa"
    };

    reservas.push(reserva);
    carro.disponivel = false;

    // Guardar alterações
    saveData("reservas.json", reservas);
    saveData("carros.json", carros);

    res.json({
        mensagem: "Reserva criada com sucesso!",
        reserva
    });
});

// GET - Listar reservas
app.get('/reservas', (req, res) => {
    const reservas = loadData("reservas.json");
    res.json(reservas);
});

// PUT - Finalizar reserva
app.put('/reservas/:id/finalizar', (req, res) => {
    const reservas = loadData("reservas.json");
    const carros = loadData("carros.json");

    const id = parseInt(req.params.id);
    const reserva = reservas.find(r => r.id === id);

    if (!reserva) {
        return res.status(400).json({ erro: "Reserva não encontrada!" });
    }

    reserva.status = "finalizada";

    // Liberar carro
    const carro = carros.find(c => c.id === reserva.carroId);
    carro.disponivel = true;

    saveData("reservas.json", reservas);
    saveData("carros.json", carros);

    res.json({ mensagem: "Reserva finalizada!" });
});

// Delete - deletar uma reserva
app.delete('/reservas/:id', (req, res) => {
    const reservas = loadData("reservas.json");
    const id = parseInt(req.params.id);
    const index = reservas.findIndex(r => r.id === id);

    if (index === -1) {
        return res.status(400).json({ erro: "Reserva não encontrada!" });
    }

    reservas.splice(index, 1);
    saveData("reservas.json", reservas);

    res.json({ mensagem: "Reserva deletada!" });
});
 

app.listen(port, () => {
    console.log(`API RENT-A-CAR correndo na porta ${port}`);
});
