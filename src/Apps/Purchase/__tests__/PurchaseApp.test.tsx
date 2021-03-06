import {
  PurchaseAppTestQueryRawResponse,
  PurchaseAppTestQueryResponse,
} from "__generated__/PurchaseAppTestQuery.graphql"
import { UntouchedBuyOrder } from "Apps/__tests__/Fixtures/Order"
import { SystemContextProvider } from "Artsy"
import { MockBoot, renderRelayTree } from "DevTools"
import React from "react"
import { HeadProvider } from "react-head"
import { graphql } from "react-relay"
import { PurchaseHistoryProps } from "../Components/PurchaseHistory"
import { PurchaseAppFragmentContainer } from "../PurchaseApp"

jest.unmock("react-relay")

const pageInfo: PurchaseAppTestQueryRawResponse["me"]["orders"]["pageInfo"] = {
  startCursor: "NQ",
  endCursor: "MQ",
  hasNextPage: true,
  hasPreviousPage: false,
}

const pageCursors: PurchaseAppTestQueryRawResponse["me"]["orders"]["pageCursors"] = {
  around: [
    {
      cursor: "",
      isCurrent: true,
      page: 1,
    },
    {
      cursor: "NQ",
      isCurrent: false,
      page: 2,
    },
    {
      cursor: "MTA",
      isCurrent: false,
      page: 3,
    },
    {
      cursor: "MTU",
      isCurrent: false,
      page: 4,
    },
  ],
  first: null,
  last: {
    cursor: "MzA",
    isCurrent: false,
    page: 7,
  },
  previous: null,
}

const render = (me: PurchaseAppTestQueryRawResponse["me"], user: User) =>
  renderRelayTree({
    Component: (props: PurchaseAppTestQueryResponse) => (
      <PurchaseAppFragmentContainer
        me={{
          ...me,
        }}
        {...props}
      />
    ),
    mockData: {
      me,
    } as PurchaseAppTestQueryRawResponse,
    query: graphql`
      query PurchaseAppTestQuery @raw_response_type {
        me {
          ...PurchaseApp_me
        }
      }
    `,
    wrapper: children => (
      <MockBoot>
        <HeadProvider>
          <SystemContextProvider user={user}>{children}</SystemContextProvider>
        </HeadProvider>
      </MockBoot>
    ),
  })

describe("Purchase app", () => {
  describe("User with admin privilages", () => {
    const userType = { type: "Admin" }
    describe("having previous orders", () => {
      it("renders orders with view details button", async () => {
        // TODO: revisit mocking and remove `artist_names` alias from PurchseHistory
        const mockMe = {
          id: "111",
          orders: {
            edges: [{ node: UntouchedBuyOrder }],
            pageInfo,
            pageCursors,
          },
        }
        const component = await render(mockMe, userType)
        const text = component.text()
        expect(text).toContain(
          "PurchasesLisa BreslowGramercy Park South, 2016buypending"
        )
        const btn = component.find("Button")
        expect(btn.length).toBe(1)
        expect(btn.text()).toEqual("View details")
      })
    })
    describe("with around pages", () => {
      it("renders pagination component", async () => {
        const mockMe = {
          id: "111",
          orders: {
            edges: [{ node: UntouchedBuyOrder }],
            pageInfo,
            pageCursors,
          },
        }
        const component = await render(mockMe, userType)

        const refetchSpy = jest.spyOn(
          (component.find("PurchaseHistory").props() as PurchaseHistoryProps)
            .relay,
          "refetch"
        )

        const pagination = component.find("LargePagination")
        expect(pagination.length).toBe(1)
        expect(pagination.text()).toContain("1234...7")
        pagination
          .find("button")
          .at(1)
          .simulate("click")
        expect(refetchSpy).toHaveBeenCalledTimes(1)
        expect(refetchSpy.mock.calls[0][0]).toEqual(
          expect.objectContaining({ first: 10, after: "NQ" })
        )
      })
    })
    describe("without previous orders", () => {
      it("shows No orders", async () => {
        const mockMe = {
          id: "111",
          orders: { edges: [], pageInfo, pageCursors },
        }
        const component = await render(mockMe, userType)
        const text = component.text()
        expect(text).toContain("No Orders")
        const btn = component.find("Button")
        expect(btn.length).toBe(0)
      })
    })
  })
  describe("User without admin privilages", () => {
    it("gives error", async () => {
      const mockMe = {
        id: "111",
        orders: { edges: [{ node: UntouchedBuyOrder }], pageInfo, pageCursors },
      }
      const component = await render(mockMe, { type: "regular-user" })
      const text = component.text()
      expect(text).not.toContain(
        "PurchasesLisa BreslowGramercy Park South, 2016buypending"
      )
      expect(text).toContain(
        "Sorry, the page you were looking for doesn’t exist at this URL."
      )
    })
  })
})
