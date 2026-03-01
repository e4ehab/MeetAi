//component we can use whenever we need to generate avatar based on seed value
import { createAvatar } from "@dicebear/core";
import { botttsNeutral, initials } from "@dicebear/collection";
//initials -> create avatar using the initials of user name (mohamed ehab -> ME avatar)
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface GeneratedAvatarProps {
    seed: string;
    classname?: string;
    variant?: "botttsNeutral" | "initials";
}

export const GeneratedAvatar = ({ seed, classname, variant = "initials" }: GeneratedAvatarProps) => {
    let avatar;
    if (variant === "botttsNeutral") {
        avatar = createAvatar(botttsNeutral, {
            seed: seed,
        })
    }
    else {
        avatar = createAvatar(initials, {
            seed: seed,
            fontWeight: 500,
            fontSize: 42,
        });
    }

    return (
        <Avatar className={cn(classname)}>
            <AvatarImage src={avatar.toDataUri()} alt="Avatar" />
            <AvatarFallback > {seed.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
    );
};

