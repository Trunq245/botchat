

export async function sendMessage(message, imageFile) {
  const formData = new FormData();
  if (message) formData.append("message", message);
  if (imageFile) formData.append("image", imageFile);

  const res = await fetch("http://localhost:5000/chat", {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  return data.answer;
}
