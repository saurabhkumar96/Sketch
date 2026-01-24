document.getElementById("createRoom").onclick = () => {
  const id = Math.random().toString(36).slice(2, 8)
  window.location.href = `/room/${id}`
}

document.getElementById("joinRoom").onclick = () => {
  const id = document.getElementById("roomInput").value
  if (id) window.location.href = `/room/${id}`
}