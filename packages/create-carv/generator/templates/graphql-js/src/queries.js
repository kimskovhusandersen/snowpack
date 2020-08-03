import { gql } from '@carv/runtime'

export const fetchViewer = gql`
  query FetchViewer {
    viewer {
      id
      firstName
      lastName
    }
  }
`
