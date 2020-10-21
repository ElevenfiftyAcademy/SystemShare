const SystemInformation = require("systeminformation");

const mainView = document.getElementById("main");
const emailInput = document.getElementById("emailEntry");
const classSelect = document.getElementById("classSelect");
const runButton = document.getElementById("systemDetectionButton");
const specDisplay = document.getElementById("specDisplay");

let emailValue = "";
let chosenClass = "";

runButton.addEventListener("click", generateSystemInformation);
emailInput.addEventListener("keyup", (e) => {
  emailValue = e.target.value;
});
classSelect.addEventListener("change", (e) => {
  chosenClass = e.target.value;
});

async function generateSystemInformation() {
  /*
    This function's purpose is to sequentially retrieve the system's specifications.
  */
  if (emailValue && chosenClass) {
    try {
      let {
        manufacturer,
        brand,
        physicalCores,
      } = await SystemInformation.cpu();
      let disks = (await SystemInformation.diskLayout()).map(
        ({ name, size, type }) => ({
          name,
          size: getSize(size),
          type,
        })
      );
      let memory = getSize((await SystemInformation.mem()).total);
      let { platform, release } = await SystemInformation.osInfo();
      let graphicsDevices = (
        await SystemInformation.graphics()
      ).controllers.map(({ model }) => ({ model }));
      const specs = {
        cpu: {
          manufacturer,
          brand,
          cores: physicalCores,
        },
        disks,
        memory,
        os: {
          platform,
          release,
        },
        gpu: graphicsDevices,
        email: emailValue,
        classChoice: chosenClass,
      };
      console.log(specs);
      let response = await (
        await fetch("http://localhost:3000/api/systeminfo/report", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(specs),
        })
      ).json();
      console.log(response);
      displaySpecifications(specs);
    } catch (e) {
      console.log(e);
    }
  } else {
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

  osElement.innerText = `${specifications.os.platform} ${specifications.os.release}`;
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
  for (let unit of ["B", "KB", "MB", "GB", "TB", "PB"]) {
    if (bytes < factor) {
      return {
        amount: Math.ceil(bytes),
        unit,
      };
    }
    bytes /= factor;
  }
}
