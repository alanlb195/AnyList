import { createParamDecorator, ExecutionContext, ForbiddenException, InternalServerErrorException } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import { User } from "src/users/entities/user.entity";
import { ValidRoles } from "../enums/valid-roles.enums";


export const CurrentUser = createParamDecorator(
    (roles: ValidRoles[] = [], context: ExecutionContext): User => {
        const ctx = GqlExecutionContext.create(context);
        const user = ctx.getContext().req.user as User;

        if (!user) {
            throw new InternalServerErrorException('No user inside the request - make sure that you used the JwtAuthGuard');
        }

        if (roles.length === 0) return user;

        for (const role of roles) {
            if (user.roles.includes(role)) {
                return user;
            }
        }

        throw new ForbiddenException(
            `User ${user.fullName} does not have the required role(s): ${roles}. He has: ${user.roles}`
        )
    }
);
