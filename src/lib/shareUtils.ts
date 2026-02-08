import html2canvas from 'html2canvas';

const APP_URL = window.location.origin;

export const shareAppLink = async (customText?: string) => {
  const text = customText || 'Descubra seu destino neste jogo místico! 🔮';
  
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'Destino - O Jogo',
        text: text,
        url: APP_URL,
      });
      return true;
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error('Erro ao compartilhar:', err);
      }
      return false;
    }
  } else {
    await navigator.clipboard.writeText(`${text}\n${APP_URL}`);
    return false;
  }
};

export const captureAndShareElement = async (elementId: string, fileName: string = 'destino.png') => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('Elemento não encontrado');
    }

    const canvas = await html2canvas(element, {
      backgroundColor: null,
      scale: 2,
      logging: false,
      useCORS: true,
    });

    return new Promise<boolean>((resolve) => {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          resolve(false);
          return;
        }

        const file = new File([blob], fileName, { type: 'image/png' });

        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: 'Meu Destino 🔮',
              text: `Confira meu destino revelado! Jogue você também em ${APP_URL}`,
            });
            resolve(true);
          } catch (err) {
            if ((err as Error).name !== 'AbortError') {
              console.error('Erro ao compartilhar imagem:', err);
              downloadImage(canvas, fileName);
            }
            resolve(false);
          }
        } else {
          downloadImage(canvas, fileName);
          resolve(false);
        }
      }, 'image/png');
    });
  } catch (error) {
    console.error('Erro ao capturar elemento:', error);
    return false;
  }
};

const downloadImage = (canvas: HTMLCanvasElement, fileName: string) => {
  const url = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.download = fileName;
  link.href = url;
  link.click();
};
