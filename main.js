const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const startBtn = document.getElementById("start-btn");
const countdownEl = document.getElementById("countdown");
const capturedPhotos = document.getElementById("captured-photos");
const capturedPhotoFirst = document.getElementById("captured-photos-first");
const photoSlots = document.querySelectorAll(".photo-slot");
const container = document.getElementById("container");
const videoSection = document.getElementById("video-section");
const downloadBtn = document.getElementById("download-pdf");

async function startWebcam() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
  } catch (err) {
    alert("Không thể truy cập webcam: " + err);
  }
}

function takePhoto() {
  const ctx = canvas.getContext("2d");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0);
  return canvas.toDataURL("image/png");
}

function countdown(seconds, onTick, onDone) {
  let count = seconds;
  onTick(count);
  const timer = setInterval(() => {
    count--;
    if (count >= 0) onTick(count);
    if (count === 0) {
      clearInterval(timer);
      onDone();
    }
  }, 1000);
}

function startShooting() {
  const total = 10;
  let index = 0;
  startBtn.disabled = true;
  countdownEl.textContent = "";
  capturedPhotos.innerHTML = "";
  capturedPhotoFirst.innerHTML = "";

  startBtn.style.display = "none";

  function shootNext() {
    if (index >= total) {
      finishShooting();
      return;
    }

    countdown(
      1,
      (sec) => {
        countdownEl.textContent = `Ảnh ${index + 1} - ${sec}s...`;
      },
      () => {
        const dataUrl = takePhoto();
        const img = document.createElement("img");
        img.src = dataUrl;

        img.addEventListener("click", () => {
          assignToSlot(dataUrl);
        });

        capturedPhotos.appendChild(img);
        capturedPhotoFirst.appendChild(img.cloneNode(true));
        index++;
        shootNext();
      }
    );
  }

  shootNext();
}

function finishShooting() {
  countdownEl.textContent = "Đã chụp xong!";
  // videoSection.style.display = "none";
  // container.style.display = "flex";
  // downloadBtn.style.display = "block";
}

function assignToSlot(dataUrl) {
  for (let slot of photoSlots) {
    // Nếu slot chưa có ảnh thì gán ảnh mới
    if (!slot.style.backgroundImage || slot.dataset.filled === "false") {
      slot.style.backgroundImage = `url(${dataUrl})`;
      slot.dataset.filled = "true"; // Đánh dấu slot đã có hình

      // Nếu người dùng bấm lại để xóa hình
      slot.addEventListener("click", function onClick() {
        slot.style.backgroundImage = "";
        slot.dataset.filled = "false";
        slot.removeEventListener("click", onClick); // Xóa sự kiện sau khi thực hiện
      });

      break;
    }
  }
}


const colorPicker = document.getElementById('colorPicker');
const bgImageOptions = document.querySelectorAll('.bg-thumbnail');

// Đổi màu nền khi chọn màu
colorPicker.addEventListener('input', (e) => {
  const color = e.target.value;
  document.getElementById('selected-photos').style.background = color;
  document.getElementById('selected-photos').style.backgroundImage = 'none'; // Xóa ảnh nếu có
});

// Đổi ảnh nền khi click ảnh có sẵn
bgImageOptions.forEach(img => {
  img.addEventListener('click', () => {
    const imageUrl = img.src;
    const selectedPhotos = document.getElementById('selected-photos');
    selectedPhotos.style.backgroundImage = `url(${imageUrl})`;
    selectedPhotos.style.backgroundSize = 'cover';
    selectedPhotos.style.backgroundPosition = 'center';
  });
});

document.getElementById("download-pdf").addEventListener("click", async () => {
  const selectedPhotos = document.getElementById("selected-photos");

  const originalBg = selectedPhotos.style.background;
  const originalBgImg = selectedPhotos.style.backgroundImage;

  try {
    const dataUrl = await domtoimage.toPng(selectedPhotos);

    const pdf = new jspdf.jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [selectedPhotos.offsetWidth, selectedPhotos.offsetHeight],
    });

    pdf.addImage(dataUrl, 'PNG', 0, 0, selectedPhotos.offsetWidth, selectedPhotos.offsetHeight);
    pdf.save("photobooth.pdf");
  } catch (error) {
    alert("Lỗi khi tạo ảnh: " + error);
  }

  selectedPhotos.style.background = originalBg;
  selectedPhotos.style.backgroundImage = originalBgImg;
});


startBtn.addEventListener("click", startShooting);
startWebcam();
