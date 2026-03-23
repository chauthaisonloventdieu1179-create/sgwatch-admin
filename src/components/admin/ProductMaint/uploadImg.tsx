import Image from "next/image";
import { useDropzone } from "react-dropzone";

interface ImageUploaderProps {
  image: File | string | null;
  onChange: (file: File | null) => void;
  label: string;
  error?: boolean;
}

const ImageUploader = ({
  image,
  onChange,
  label,
  error,
}: ImageUploaderProps) => {
  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onChange(acceptedFiles[0]);
    }
  };

  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/gif": [".gif"],
    },
    maxSize: 10 * 1024 * 1024,
    noClick: true,
    noKeyboard: true,
  });

  const safeId = label.replace(/\s+/g, "-").toLowerCase() + "-input";

  return (
    <div className="w-full z-20">
      <label className="text-[14px] font-[400] text-[#000000]">{label}</label>

      {/* Input render nhưng ko cần ref riêng */}
      <input {...getInputProps()} id={safeId} style={{ display: "none" }} />

      <div
        className={`mt-[8px] w-[200px] h-[200px] rounded-[8px] flex justify-center items-center  ${
          error
            ? "border-[#FF7777] border-[3px]"
            : "border-[2px] border-[#C8C8C8]"
        } `}
      >
        {image ? (
          <div className="relative w-[200px] h-[200px] overflow-hidden flex justify-center items-center">
            <Image
              src={
                typeof image === "string" ? image : URL.createObjectURL(image)
              }
              width={200}
              height={200}
              className="object-cover w-full h-full"
              alt="uploaded"
              unoptimized={true}
            />

            <div className="absolute bottom-[10px] right-[10px] flex gap-2">
              <button
                className="bg-[#9E9E9E] text-white px-3 py-1 text-[12px] rounded-[5px]"
                onClick={open} // gọi open() để mở file dialog
                type="button"
              >
                Đổi
              </button>
              <button
                className="bg-[#9E9E9E] text-white w-[32px] h-[32px] flex justify-center items-center rounded-[5px]"
                onClick={() => onChange(null)}
                type="button"
              >
                <Image
                  src="/epack/remove_admin.svg"
                  alt="remove"
                  width={14}
                  height={17}
                />
              </button>
            </div>
          </div>
        ) : (
          <div
            {...getRootProps()}
            className="w-[176px] h-[176px] border-dashed border-[2px] border-[#C8C8C8] rounded-[8px] flex flex-col items-center justify-center gap-[10px] cursor-pointer hover:text-[14px] transition-all duration-200 ease-out
        hover:scale-105 active:scale-95
        hover:shadow-[0_8px_24px_rgba(0,0,0,.25)]
        focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/20"
            onClick={open} // thay vì handleOpenFile gọi open trực tiếp
          >
            <div className="w-[48px] h-[48px] flex justify-center items-center">
              <Image
                src="/epack/upload_img.svg"
                alt="upload"
                width={33}
                height={42}
              />
            </div>
            <div className="text-center text-[12px] font-medium text-[#212222]">
              Kéo thả file vào đây <br />
              hoặc
            </div>
            <div className="w-[105px] h-[32px] text-[12px] font-medium cursor-pointer rounded-[10px] bg-[#212222] text-white flex justify-center items-center">
              Chọn file
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;
