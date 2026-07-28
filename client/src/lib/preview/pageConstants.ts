/** A4 dimensions at 96 DPI (CSS pixels) — shared by preview and export */
export const A4_WIDTH_PX = 794;
export const A4_HEIGHT_PX = 1123;

export const PREVIEW_ZOOM_MIN = 0.5;
export const PREVIEW_ZOOM_MAX = 1.5;
export const PREVIEW_ZOOM_DEFAULT = 0.75;

export function getContentArea(pageSettings: {
  marginTop: number;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
}): { width: number; height: number } {


  return {
    width: A4_WIDTH_PX - pageSettings.marginLeft - pageSettings.marginRight,
    height:
      A4_HEIGHT_PX -
      pageSettings.marginTop -
      pageSettings.marginBottom ,
  };
}