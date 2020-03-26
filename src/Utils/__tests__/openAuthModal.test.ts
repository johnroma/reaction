import * as SchemaV2 from "Artsy/Analytics/v2/Schema"
import { ModalType } from "Components/Authentication/Types"
import {
  AuthModalOptions,
  openAuthModal,
  openAuthToFollowSave,
} from "../openAuthModal"

jest.mock("sharify", () => ({ data: jest.fn() }))
const sd = require("sharify").data

const artistArgs: AuthModalOptions = {
  contextModule: SchemaV2.ContextModule.artistHeader,
  entity: {
    slug: "andy-warhol",
    name: "Andy Warhol",
  },
  intent: SchemaV2.AuthIntent.followArtist,
}

const partnerArgs: AuthModalOptions = {
  contextModule: SchemaV2.ContextModule.aboutTheWork,
  entity: {
    slug: "david-zwirner",
    name: "David Zwirner",
  },
  intent: SchemaV2.AuthIntent.followGallery,
}

const artworkArgs: AuthModalOptions = {
  contextModule: SchemaV2.ContextModule.artworkGrid,
  entity: {
    slug: "andy-warhol-skull",
    name: "Skull",
  },
  intent: SchemaV2.AuthIntent.saveArtwork,
}

describe("openAuth Helpers", () => {
  let mediator

  beforeEach(() => {
    mediator = {
      trigger: jest.fn(),
    }
    window.location.assign = jest.fn()
  })

  describe("#openAuthModal", () => {
    it("calls the mediator with expected args", () => {
      openAuthModal(mediator, {
        mode: ModalType.signup,
        intent: SchemaV2.AuthIntent.signup,
        contextModule: SchemaV2.ContextModule.header,
        copy: "Sign up to do cool stuff",
      })

      expect(mediator.trigger).toBeCalledWith("open:auth", {
        contextModule: "header",
        copy: "Sign up to do cool stuff",
        intent: "signup",
        mode: "signup",
      })
    })
  })

  describe("#openAuthToFollowSave", () => {
    describe("desktop", () => {
      it("transforms args for following artists", () => {
        openAuthToFollowSave(mediator, artistArgs)

        expect(mediator.trigger).toBeCalledWith("open:auth", {
          afterSignUpAction: {
            action: "follow",
            kind: "artist",
            objectId: "andy-warhol",
          },
          contextModule: "artistHeader",
          copy: "Sign up to follow Andy Warhol",
          intent: "followArtist",
          mode: "signup",
        })
      })

      it("transforms args for following partners", () => {
        openAuthToFollowSave(mediator, partnerArgs)

        expect(mediator.trigger).toBeCalledWith("open:auth", {
          afterSignUpAction: {
            action: "follow",
            kind: "profile",
            objectId: "david-zwirner",
          },
          contextModule: "aboutTheWork",
          copy: "Sign up to follow David Zwirner",
          intent: "followGallery",
          mode: "signup",
        })
      })

      it("transforms args for saving artworks", () => {
        openAuthToFollowSave(mediator, artworkArgs)

        expect(mediator.trigger).toBeCalledWith("open:auth", {
          afterSignUpAction: {
            action: "save",
            kind: "artworks",
            objectId: "andy-warhol-skull",
          },
          contextModule: "artworkGrid",
          copy: "Sign up to save artworks",
          intent: "saveArtwork",
          mode: "signup",
        })
      })
    })

    describe("mobile", () => {
      beforeEach(() => {
        sd.IS_MOBILE = true
      })

      it("transforms args for following artists", () => {
        openAuthToFollowSave(mediator, artistArgs)
        expect(window.location.assign).toBeCalledWith(
          "/sign_up?redirectTo=http%3A%2F%2Flocalhost%2F&action=follow&contextModule=artistHeader&copy=Sign%20up%20to%20follow%20Andy%20Warhol&intent=followArtist&kind=artist&objectId=andy-warhol"
        )
        expect(mediator.trigger).not.toBeCalled()
      })

      it("transforms args for following partners", () => {
        openAuthToFollowSave(mediator, partnerArgs)
        expect(window.location.assign).toBeCalledWith(
          "/sign_up?redirectTo=http%3A%2F%2Flocalhost%2F&action=follow&contextModule=aboutTheWork&copy=Sign%20up%20to%20follow%20David%20Zwirner&intent=followGallery&kind=profile&objectId=david-zwirner"
        )
        expect(mediator.trigger).not.toBeCalled()
      })

      it("transforms args for saving artworks", () => {
        openAuthToFollowSave(mediator, artworkArgs)
        expect(window.location.assign).toBeCalledWith(
          "/sign_up?redirectTo=http%3A%2F%2Flocalhost%2F&action=save&contextModule=artworkGrid&copy=Sign%20up%20to%20save%20artworks&intent=saveArtwork&kind=artworks&objectId=andy-warhol-skull"
        )
        expect(mediator.trigger).not.toBeCalled()
      })
    })
  })
})
