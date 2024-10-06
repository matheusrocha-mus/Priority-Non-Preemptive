// Função para adicionar um novo processo
function addProcess(processes, process) {
    processes.push(process);

    displayNewProcess(process);
}

// Função para exibir os processos na tabela
function displayNewProcess(process) {
    const tableBody = document.querySelector('#processList tbody');
    const newRow = document.createElement('tr');

    newRow.innerHTML = `
        <td>${process.name}</td>
        <td>${process.arrivalTime}</td>
        <td>${process.burstTime}</td>
        <td>${process.priority}</td>
    `;

    tableBody.appendChild(newRow);
}

// Algoritmo de Escalonamento por Prioridade (Não Preemptivo)
function priorityScheduling(processes) {
    let currentTime = 0;
    let ganttData = [];
    let completedProcesses = 0;
    const totalProcesses = processes.length;

    while (completedProcesses < totalProcesses) {
        // Filtra os processos que já chegaram e que ainda têm tempo restante
        const availableProcesses = processes.filter(p => p.arrivalTime <= currentTime && p.remainingTime > 0);

        if (availableProcesses.length > 0) {
            // Ordena os processos disponíveis pela prioridade (menor valor = maior prioridade) depois pelo tempo de execução (menor valor = maior prioridade) e por último pela ordem de chegada (menor valor = maior prioridade)
            availableProcesses.sort((a, b) => {
                if (a.priority !== b.priority) return a.priority - b.priority;
                else if (a.burstTime !== b.burstTime) return a.burstTime - b.burstTime;
                else return a.arrivalTime - b.arrivalTime;
            });

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

// Função para exibir o gráfico de Gantt com "X" para tempo de execução
function displayGanttChart(ganttData) {
    const ganttTable = document.getElementById('ganttChart');
    ganttTable.innerHTML = '';

    const totalTime = Math.max(...ganttData.map(g => g.endTime));
    
    // Adiciona a linha de tempos (header)
    let timeRow = '<tr><th class="timeHeader">Tempo</th>';
    for (let i = 0; i < totalTime; i++) {
        timeRow += `<th class="timeHeader">${i}</th>`;
    }
    timeRow += '</tr>';
    ganttTable.innerHTML += timeRow;

    // Adiciona as linhas para cada processo
    ganttData.forEach(data => {
        let processRow = `<tr><th class="processHeader">${data.processName}</th>`;
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

// Função principal para iniciar o escalonamento e exibir o gráfico de Gantt
document.addEventListener("DOMContentLoaded", function () {
    let processes = [];

    document.getElementById('processForm').addEventListener('submit', function(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const process = Object.fromEntries(formData);

        Object.keys(process).forEach(key => process[key] = parseInt(process[key]));

        process.name = "P" + (processes.length + 1);
        process.remainingTime = process.burstTime;

        const modal = document.getElementById('processModal');
        const modalInstance = bootstrap.Modal.getInstance(modal) || new bootstrap.Modal(modal);
        modalInstance.hide();

        addProcess(processes, process);
    });

    document.getElementById('startScheduling').addEventListener('click', function() {
        if (processes.length === 0) alert('Adicione pelo menos um processo antes de iniciar o escalonamento!');
        else {
            const ganttData = priorityScheduling(processes);
            displayGanttChart(ganttData);
        }
    });
});