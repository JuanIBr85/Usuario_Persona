import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import React from "react";
const SimpleCarousel = ({ children, setApi, showCarouselControls=false, className }) => {
    return (
        <Carousel setApi={setApi} className={className}>
            <CarouselContent>
                {React.Children.map(children, (child, index) => (
                    <CarouselItem key={`carousel-${index}`}>
                        {child}
                    </CarouselItem>
                ))}
            </CarouselContent>
            {showCarouselControls && <>
                <CarouselPrevious />
                <CarouselNext />
            </>}
        </Carousel>
    )
}

export default SimpleCarousel;
