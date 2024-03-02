import { ResizableWindows } from "../utils/ResizableWindows.js";

const root = document.getElementById("root");

const w = new ResizableWindows("Teste", "./c/teste.html");
const x = new ResizableWindows("TesteX", "./c/teste.html");

root.appendChild(w.getComponent());
root.appendChild(x.getComponent());

function convertFromWindow(name, elemId) {
  root.appendChild(
    new ResizableWindows(name, document.getElementById(elemId)).getComponent()
  );
}
// convertFromWindow("um", "hello");
// convertFromWindow("dois", "my");

// const div = document.createElement("div")
// div.innerText = "Texthuhjjo"

//const meuapp = new ResizableWindows('Exemplo', 'teste')

root.appendChild(new ResizableWindows("imagem", document.getElementById("layout")).getComponent())