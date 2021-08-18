const SystemInformation = require("systeminformation");

const emailInput = document.getElementById("emailEntry");
const runButton = document.getElementById("systemDetectionButton");
const cardbody = document.getElementById("form");
const spinner = document.getElementById('spinner');
const finalMessage = document.getElementById('finalMessage');

// const myCard = document.getElementById('myCard');

let emailValue = "";

runButton.addEventListener("click", generateSystemInformation);
emailInput.addEventListener("keyup", (e) => {
  emailValue = e.target.value;
});

async function generateSystemInformation(e) {
  e.preventDefault();
  /*
    This function's purpose is to sequentially retrieve the system's specifications.
  */

  if (emailValue) {
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
      spinner.style.display = "none";
      finalMessage.style.display = "block";

    } catch (e) {
      cardbody.style.display = "block";
      spinner.style.display = "none";
      document.getElementById('errorAlert').style.display = "block";
    }
  } else {
    document.getElementById('emailError').classList.add('visible');
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
