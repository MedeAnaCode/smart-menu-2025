import {useEffect, useState, type ImgHTMLAttributes} from "react";

const fallbackImage = "/img/recipes/unknown.jpg";

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
    src?: string | null;
};

export default function RecipeImage({src, onError, ...props}: Props) {
    const [currentSource, setCurrentSource] = useState(src || fallbackImage);

    useEffect(() => {
        setCurrentSource(src || fallbackImage);
    }, [src]);

    return (
        <img
            {...props}
            src={currentSource}
            onError={(event) => {
                onError?.(event);
                if (currentSource !== fallbackImage) setCurrentSource(fallbackImage);
            }}
        />
    );
}
