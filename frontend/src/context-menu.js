// inset context-menu html & css
document.body.insertAdjacentHTML('afterbegin', `
  <div id="context-menu" style="display: none">
    <ul class="menu">
      <li id="cut">Cut</li>
      <li id="copy">Copy</li>
      <li id="paste">Paste</li>
    </ul>
    
    <style>
      #context-menu {
        position: absolute;
        font-family: monospace;
        font-size: 15px;
        user-select: none;
        z-index: 99999;
      }
      #context-menu > .menu {
        display: flex;
        flex-direction: column;
        background-color: #fff;
        border-radius: 4px;
        box-shadow: 2px 2px 4px 1px rgb(64 64 64 / 33%);
        list-style: none;
        padding: 5px 0;
        margin: 0;
      }
      #context-menu > .menu > li {
        font: inherit; 
        border: 0;
        padding: 10px 30px 10px 15px;
        width: 100%;
        display: flex;
        align-items: center;
        position: relative;
        text-decoration: unset;
        color: #000;
        font-weight: 500;
        cursor: pointer;
      }
      #context-menu > .menu > li:hover {
        background: #dfdfdf;
      }
    </style>
  </div>
`);

const contextMenu = document.getElementById("context-menu");
let target = null;

document.oncontextmenu = function(e) {
  if (contextMenu.contains(e.target)) return;
  // e.preventDefault();

  target = e.target;

  const tagName = target.tagName.toLowerCase();
  const editable = (tagName === 'input' || tagName === 'textarea');
  const textSelected = !!(getSelection().toString());
  
  if (!(editable || textSelected)) return;

  document.getElementById('cut').style.display = textSelected && editable ? '' : 'none';
  document.getElementById('paste').style.display = editable ? '' : 'none';
  document.getElementById('copy').style.display = textSelected ? '' : 'none';

  contextMenu.style.display = 'block';
  contextMenu.style.left = e.pageX + "px";
  contextMenu.style.top = e.pageY + "px";
}

document.onmousedown = function(e) {
  if (!contextMenu.contains(e.target)) hideMenu();
}

// prevent focus on click
contextMenu.onmousedown = function(e) {
  e.preventDefault()
}

document.getElementById('cut').onclick = function() {
  document.execCommand('cut');
  hideMenu();
  target.focus();
}

document.getElementById('copy').onclick = function(e) {
  // winwindow.runtime.ClipboardSetText(getSelection().toString())
  document.execCommand('copy');
  hideMenu();
  target.focus();
}

document.getElementById('paste').onclick = async function(e) {
  const text = await window.runtime.ClipboardGetText();
  if (text) document.execCommand("insertText", false, text);
  hideMenu();
}

function hideMenu() {
  contextMenu.style.display = 'none';
}
