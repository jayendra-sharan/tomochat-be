import { GraphQLResolveInfo } from "graphql";
import graphqlFields from "graphql-fields";

export function getRequestFields(
  info: GraphQLResolveInfo,
  rootFields = ""
): Record<string, boolean> {
  const fields = graphqlFields(info);
  const resolved = rootFields ? fields[rootFields] || {} : fields;
  return Object.keys(resolved).reduce(
    (acc, key) => {
      acc[key] = true;
      return acc;
    },
    {} as Record<string, boolean>
  );
}
