const REPLICATE_API_KEY = import.meta.env.VITE_REPLICATE_API_KEY;
const IDM_VTON_VERSION = 'c871bb9b046607b680449ecbae55fd8c6d945e0a1948644bf2361b3d021d3ff4';

export async function generateTryOn({ humanImgUrl, garmImgUrl, garmentDesc }) {
  const response = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      Authorization: `Token ${REPLICATE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      version: IDM_VTON_VERSION,
      input: {
        human_img: humanImgUrl,
        garm_img: garmImgUrl,
        garment_des: garmentDesc,
        is_checked: true,
        is_checked_crop: false,
        denoise_steps: 30,
        seed: 42,
      },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Replicate API error: ${response.status} ${err}`);
  }

  const prediction = await response.json();
  return pollReplicateResult(prediction.id);
}

async function pollReplicateResult(predictionId, maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    const res = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
      headers: { Authorization: `Token ${REPLICATE_API_KEY}` },
    });
    const data = await res.json();
    if (data.status === 'succeeded') return data.output;
    if (data.status === 'failed') throw new Error('Try-on generation failed');
  }
  throw new Error('Try-on timed out');
}
