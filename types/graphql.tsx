import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type List = {
  __typename?: 'List';
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  notes?: Maybe<Array<Maybe<Note>>>;
};

export type Note = {
  __typename?: 'Note';
  author: Scalars['String']['output'];
  createdAt: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  text: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
};

export type Query = {
  __typename?: 'Query';
  allLists: Array<List>;
  allNotes: Array<Note>;
  getList?: Maybe<List>;
};


export type QueryGetListArgs = {
  id: Scalars['Int']['input'];
};

export type AllListsQueryVariables = Exact<{ [key: string]: never; }>;


export type AllListsQuery = { __typename?: 'Query', allLists: Array<{ __typename?: 'List', id: number, name: string, notes?: Array<{ __typename?: 'Note', id: number, text: string, author: string } | null> | null }> };

export type AllNotesQueryVariables = Exact<{ [key: string]: never; }>;


export type AllNotesQuery = { __typename?: 'Query', allNotes: Array<{ __typename?: 'Note', id: number, text: string, author: string }> };

export type GetListQueryVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type GetListQuery = { __typename?: 'Query', getList?: { __typename?: 'List', id: number, name: string, notes?: Array<{ __typename?: 'Note', id: number, text: string, author: string } | null> | null } | null };


export const AllListsDocument = gql`
    query AllLists {
  allLists {
    id
    name
    notes {
      id
      text
      author
    }
  }
}
    `;

/**
 * __useAllListsQuery__
 *
 * To run a query within a React component, call `useAllListsQuery` and pass it any options that fit your needs.
 * When your component renders, `useAllListsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAllListsQuery({
 *   variables: {
 *   },
 * });
 */
export function useAllListsQuery(baseOptions?: Apollo.QueryHookOptions<AllListsQuery, AllListsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<AllListsQuery, AllListsQueryVariables>(AllListsDocument, options);
      }
export function useAllListsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<AllListsQuery, AllListsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<AllListsQuery, AllListsQueryVariables>(AllListsDocument, options);
        }
export type AllListsQueryHookResult = ReturnType<typeof useAllListsQuery>;
export type AllListsLazyQueryHookResult = ReturnType<typeof useAllListsLazyQuery>;
export type AllListsQueryResult = Apollo.QueryResult<AllListsQuery, AllListsQueryVariables>;
export const AllNotesDocument = gql`
    query AllNotes {
  allNotes {
    id
    text
    author
  }
}
    `;

/**
 * __useAllNotesQuery__
 *
 * To run a query within a React component, call `useAllNotesQuery` and pass it any options that fit your needs.
 * When your component renders, `useAllNotesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAllNotesQuery({
 *   variables: {
 *   },
 * });
 */
export function useAllNotesQuery(baseOptions?: Apollo.QueryHookOptions<AllNotesQuery, AllNotesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<AllNotesQuery, AllNotesQueryVariables>(AllNotesDocument, options);
      }
export function useAllNotesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<AllNotesQuery, AllNotesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<AllNotesQuery, AllNotesQueryVariables>(AllNotesDocument, options);
        }
export type AllNotesQueryHookResult = ReturnType<typeof useAllNotesQuery>;
export type AllNotesLazyQueryHookResult = ReturnType<typeof useAllNotesLazyQuery>;
export type AllNotesQueryResult = Apollo.QueryResult<AllNotesQuery, AllNotesQueryVariables>;
export const GetListDocument = gql`
    query GetList($id: Int!) {
  getList(id: $id) {
    id
    name
    notes {
      id
      text
      author
    }
  }
}
    `;

/**
 * __useGetListQuery__
 *
 * To run a query within a React component, call `useGetListQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetListQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetListQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetListQuery(baseOptions: Apollo.QueryHookOptions<GetListQuery, GetListQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetListQuery, GetListQueryVariables>(GetListDocument, options);
      }
export function useGetListLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetListQuery, GetListQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetListQuery, GetListQueryVariables>(GetListDocument, options);
        }
export type GetListQueryHookResult = ReturnType<typeof useGetListQuery>;
export type GetListLazyQueryHookResult = ReturnType<typeof useGetListLazyQuery>;
export type GetListQueryResult = Apollo.QueryResult<GetListQuery, GetListQueryVariables>;