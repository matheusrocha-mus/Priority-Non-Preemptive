let processes = [];

// Função para adicionar um novo processo
function addProcess(name, arrivalTime, burstTime, priority) {
    const process = {
        name: name,
        arrivalTime: parseInt(arrivalTime),
        burstTime: parseInt(burstTime),
        priority: parseInt(priority),
        remainingTime: parseInt(burstTime),
    };
    processes.push(process);
}

// Função para obter todos os processos
function getProcesses() {
    return processes;
}

// Algoritmo de Escalonamento por Prioridade (Não Preemptivo)
function priorityScheduling() {
    let currentTime = 0;
    let ganttData = [];
    let completedProcesses = 0;
    const totalProcesses = processes.length;
    
    while (completedProcesses < totalProcesses) {
        // Filtra os processos que já chegaram e que ainda têm tempo restante
        const availableProcesses = processes.filter(p => p.arrivalTime <= currentTime && p.remainingTime > 0);
        
        if (availableProcesses.length > 0) {
            // Ordena os processos disponíveis pela prioridade (menor valor = maior prioridade)
            availableProcesses.sort((a, b) => a.priority - b.priority);
            
            // Seleciona o processo com maior prioridade (menor valor de prioridade)
            const currentProcess = availableProcesses[0];
            
            // Adiciona o processo ao gráfico de Gantt com seu tempo de execução total
            ganttData.push({
                processName: currentProcess.name,
                startTime: currentTime,
                endTime: currentTime + currentProcess.remainingTime
            });

            // Atualiza o tempo atual com o tempo de execução completo do processo
            currentTime += currentProcess.remainingTime;

            // Marca o processo como concluído (tempo restante = 0)
            currentProcess.remainingTime = 0;

            // Incrementa o número de processos concluídos
            completedProcesses++;
        } else {
            // Se não houver processos disponíveis, avança o tempo até o próximo processo chegar
            currentTime++;
        }
    }

    return ganttData;
}

// Função para processar o arquivo CSV e adicionar os processos
function processFile(content) {
    const lines = content.split('\n');
    lines.forEach(line => {
        const [name, arrivalTime, burstTime, priority] = line.split(',');
        if (name && arrivalTime && burstTime && priority) {
            addProcess(name.trim(), parseInt(arrivalTime), parseInt(burstTime), parseInt(priority));
        }
    });
    displayProcesses();
}

// Função para exibir os processos na tabela
function displayProcesses() {
    const tableBody = document.querySelector('#processList tbody');
    tableBody.innerHTML = '';

    const processes = getProcesses();
    processes.forEach(process => {
        tableBody.innerHTML += `
            <tr>
                <td>${process.name}</td>
                <td>${process.arrivalTime}</td>
                <td>${process.burstTime}</td>
                <td>${process.priority}</td>
            </tr>
        `;
    });
}

// Função para exibir o gráfico de Gantt com "X" para tempo de execução
function displayGanttChart(ganttData) {
    const ganttTable = document.getElementById('ganttChart');
    ganttTable.innerHTML = '';

    const totalTime = Math.max(...ganttData.map(g => g.endTime));
    
    // Adiciona a linha de tempos (header)
    let timeRow = '<tr><th>Tempo</th>';
    for (let i = 0; i < totalTime; i++) {
        timeRow += `<th>${i}</th>`;
    }
    timeRow += '</tr>';
    ganttTable.innerHTML += timeRow;

    // Adiciona as linhas para cada processo
    ganttData.forEach(data => {
        let processRow = `<tr><td>${data.processName}</td>`;
        for (let i = 0; i < totalTime; i++) {
            if (i >= data.startTime && i < data.endTime) {
                processRow += `<td class="ganttCell">X</td>`;
            } else {
                processRow += `<td class="ganttEmptyCell"></td>`;
            }
        }
        processRow += '</tr>';
        ganttTable.innerHTML += processRow;
    });
}

// Função para ler o arquivo CSV carregado
function readFile(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        const content = e.target.result;
        processFile(content);
    };

    if (file) {
        reader.readAsText(file);
    }
}

// Função principal para iniciar o escalonamento e exibir o gráfico de Gantt
document.addEventListener("DOMContentLoaded", function () {
    document.getElementById('fileInput').addEventListener('change', readFile);

    document.getElementById('startScheduling').addEventListener('click', function() {
        const ganttData = priorityScheduling();
        displayGanttChart(ganttData);
    });
});
