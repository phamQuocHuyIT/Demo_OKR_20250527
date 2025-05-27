const sidebar = document.getElementById("sidebar");
const toggleBtn = document.getElementById("toggleSidebar");
toggleBtn.onclick = function () {
  sidebar.classList.toggle("collapsed");
  const icon = toggleBtn.querySelector("i");
  if (sidebar.classList.contains("collapsed")) {
    icon.classList.remove("bi-chevron-left");
    icon.classList.add("bi-chevron-right");
  } else {
    icon.classList.remove("bi-chevron-right");
    icon.classList.add("bi-chevron-left");
  }
};
