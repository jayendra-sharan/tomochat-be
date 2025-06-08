import { logger } from "@/lib/logger";
import { BaseError } from "./BaseError";
import { InternalServerError } from ".";

export const handleError = {
  onExecute() {
    return {
      onExecuteDone({ result, setResult, args }) {
        if (result.errors) {
          const sanitizedErrors = result.errors.map((err) => {
            const originalError = err.originalError ?? err;

            if (originalError instanceof BaseError) {
              if (process.env.NODE_ENV === "development") {
                logger.info("HANDLED", originalError);
              }
              return originalError;
            }

            // Log unexpected errors
            logger.error(originalError, {
              userId: args.contextValue?.userId,
              path: args.contextValue?.request?.url,
            });

            return new InternalServerError();
          });

          setResult({ ...result, errors: sanitizedErrors });
        }
      },
    };
  },
};
