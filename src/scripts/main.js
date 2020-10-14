const SystemInformation = require("systeminformation");

const mainView = document.getElementById("main");
const runButton = document.getElementById("systemDetectionButton");
const specDisplay = document.getElementById("specDisplay");

runButton.addEventListener("click", generateSystemInformation);

async function generateSystemInformation() {
  /*
    This function's purpose is to sequentially retrieve the system's specifications.
  */
  try {
    let { manufactuerer, brand, physicalCores } = await SystemInformation.cpu();
    let disks = (await SystemInformation.diskLayout()).map(
      ({ name, size, type }) => ({
        name,
        size: getSize(size),
        type,
      })
    );
    let memory = getSize((await SystemInformation.mem()).total);
    let { distro, release } = await SystemInformation.osInfo();
    let graphicsDevices = (await SystemInformation.graphics()).controllers.map(
      ({ model }) => model
    );
    const specs = {
      cpu: {
        manufactuerer,
        brand,
        cores: physicalCores,
      },
      disks,
      memory,
      os: {
        distro,
        release,
      },
      graphicsDevices,
    };
    displaySpecifications(specs);
  } catch (e) {
    console.log(e);
  }
}

function displaySpecifications(specifications) {
  specDisplay.innerHTML = "";
  // mainView.style.display = "none";
  const osElement = document.createElement("p");
  const cpuElement = document.createElement("p");
  const memoryElement = document.createElement("p");
  const disksSection = document.createElement("div");
  const graphicsSection = document.createElement("div");

  osElement.innerText = `${specifications.os.distro} ${specifications.os.release}`;
  cpuElement.innerText = `${specifications.cpu.brand} with ${specifications.cpu.cores} cores`;
  memoryElement.innerText = specifications.memory + " of RAM";
  disksSection.appendChild(document.createElement("p"));
  for (let { name, size, type } of specifications.disks) {
    const diskElement = document.createElement("p");
    diskElement.innerText = `${size} ${type} ${name}`;
    disksSection.appendChild(diskElement);
  }
  for (let graphicsDevice of specifications.graphicsDevices) {
    const graphicsElement = document.createElement("p");
    graphicsElement.innerText = graphicsDevice;
    graphicsSection.appendChild(graphicsElement);
  }

  specDisplay.appendChild(osElement);
  specDisplay.appendChild(cpuElement);
  specDisplay.appendChild(memoryElement);
  specDisplay.appendChild(disksSection);
  specDisplay.appendChild(graphicsSection);
}

function getSize(bytes) {
  // Converts bytes to their respective metric factor value
  const factor = 1024;
  for (let unit of ["", "K", "M", "G", "T", "P"]) {
    if (bytes < factor) {
      return `${Math.ceil(bytes)}${unit}B`;
    }
    bytes /= factor;
  }
}
