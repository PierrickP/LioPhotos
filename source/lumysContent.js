let iframeEl = null;

async function injectGenerateChildCodeButton() {
  console.log("[INJECT injectGenerateChildCodeButton]");

  const el = `
      <div class="other">
          <h4 class="highlight" translate="">Outils additionnel</h4>
          <div layout="row" class="layout-row">
              <button
              class="project-action button-light md-raised md-button md-ink-ripple"
              type="button"
              id="ext-download-childCodeFile"
              >
              <span translate="">Télécharger fichier Enfant/Code</span>
              </button>
          </div>
      </div>
    `;

  const iframeDocument = iframeEl.contentWindow.document;

  const elementPoolingInterval = setInterval(function () {
    const adjacentEl = iframeDocument.querySelector(
      "#page md-card:nth-child(2) div.other:last-child"
    );

    if (adjacentEl) {
      clearInterval(elementPoolingInterval);

      adjacentEl.insertAdjacentHTML("afterend", el);
      iframeDocument
        .getElementById("ext-download-childCodeFile")
        .addEventListener("click", function () {
          getChildCode();
        });
    }
  }, 100);
}

function generateCSV(data, project) {
  let csvContent = "data:text/csv;charset=utf-8,";

  data.forEach(function (rowArray) {
    let row = rowArray.join(",");
    csvContent += row + "\r\n";
  });

  var encodedUri = encodeURI(csvContent);
  var link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `enfant-code-${project}.csv`);
  document.body.appendChild(link); // Required for FF

  link.click();
}

async function getChildCode() {
  const project = window.location.pathname.match(/\/projects\/(\w{24})/);

  if (!project[1]) {
    console.error("Project ID not found");

    return;
  }

  const [projectData, codeData] = await Promise.all([
    (
      await fetch(`https://app.lumys-scolaire.photo/api/projects/${project[1]}`)
    ).json(),
    (
      await fetch(
        `https://app.lumys-scolaire.photo/api/accessCodes/${project[1]}`
      )
    ).json(),
  ]);

  const students = [];

  let idx = 1;
  projectData.klasses.forEach((klass) => {
    klass.students.forEach((student) => {
      students.push([
        student.firstName,
        student.lastName,
        codeData.studentCodes[idx],
      ]);

      idx++;
    });
  });

  console.log(students);

  if (!students.length) {
    window.alert("Il faut générer le trombinoscope avant");
    return;
  }

  generateCSV(
    students.reduce(
      (tableCsv, student) => {
        tableCsv.push(student);

        return tableCsv;
      },
      [["firstname", "lastname", "code"]]
    ),
    project[1]
  );
}

function injectKlass() {
  console.log("[injectKlass]");

  const iframeDocument = iframeEl.contentWindow.document;

  const elementPoolingInterval = setInterval(function () {
    const photos = iframeDocument.querySelectorAll(".photo");

    console.log("photos", photos);

    if (photos.length) {
      clearInterval(elementPoolingInterval);
      let firstElementIdx = 0;

      photos.forEach((el) => {
        el.addEventListener(
          "click",
          function (evt) {
            if (/*evt.composed || */ evt.ctrlKey || evt.shiftKey) {
              const parentNode = evt.target.parentNode.parentNode.parentNode;
              const elIdx = Array.from(parentNode.children).indexOf(
                evt.target.parentNode.parentNode
              );

              const ps = parentNode.querySelectorAll(".photo-wrapper");

              ps.forEach((e, idx) => {
                let click = false;
                const isSelected = [...e.classList].includes("selected");

                if (idx < firstElementIdx - 1) {
                  if (isSelected) {
                    click = true;
                  }
                } else {
                  if (!isSelected && idx < elIdx - 1) {
                    click = true;
                  }
                }

                if (click) {
                  e.click();
                }
              });
            } else {
              const parentNode = evt.target.parentNode.parentNode.parentNode;
              const elIdx = Array.from(parentNode.children).indexOf(
                evt.target.parentNode.parentNode
              );

              firstElementIdx = elIdx;
            }
          },
          false
        );
      });
    }
  }, 100);
}

let previousUrl = "";
const observer = new MutationObserver(function (mutations) {
  if (location.href !== previousUrl) {
    previousUrl = location.href;
    console.log(`URL changed to ${location.href}`);

    if (location.href.match(/\/projects\/(\w{24})\/class\/(\w{24})$/)) {
      injectKlass();
    }

    if (location.href.match(/\/projects\/(\w{24})$/)) {
      injectGenerateChildCodeButton();
    }
  }
});

const iframePoolingInterval = setInterval(function () {
  iframeEl = document.querySelector("iframe");
  if (iframeEl) {
    clearInterval(iframePoolingInterval);

    iframeEl.addEventListener("load", function () {
      observer.observe(iframeEl.contentWindow.document, {
        subtree: true,
        childList: true,
      });
    });
  }
}, 100);
