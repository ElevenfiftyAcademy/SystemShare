const SystemInformation = require("systeminformation");

const mainView = document.getElementById("main");
const emailInput = document.getElementById("emailEntry");
const classSelect = document.getElementById("classSelect");
const runButton = document.getElementById("systemDetectionButton");
const cardbody = document.getElementById("form");
const spinner = document.getElementById('spinner');
const finalMessage = document.getElementById('finalMessage');

const myCard = document.getElementById('myCard');

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

    myCard.classList.add("sizeAfter");
    cardbody.style.display = "none";
    spinner.style.display = "block";

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
        await fetch(
          "https://system-share-manager.herokuapp.com/api/systeminfo/report",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(specs),
          }
        )
      ).json();
      console.log(response);
      spinner.style.display = "none";
      finalMessage.style.display = "block";

    } catch (e) {
      console.log(e);
    }
  } else {
  }
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
