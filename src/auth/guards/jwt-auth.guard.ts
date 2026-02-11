import { ExecutionContext } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { GqlExecutionContext } from "@nestjs/graphql";

export class JwtAuthGuard extends AuthGuard('jwt') {


    // override
    getRequest(context: ExecutionContext) {
        const ctx = GqlExecutionContext.create(context);
        const req = ctx.getContext().req;
        return req;
    }
}