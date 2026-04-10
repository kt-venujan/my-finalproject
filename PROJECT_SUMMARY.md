# SmartDiet Project Full Technical Summary

Generated at: 2026-04-09T08:12:55.568Z

## 1. Project Snapshot

- Workspace root: E:\external\my-finalproject
- Backend path: Backend
- Frontend path: frontend
- Backend source files analyzed: 61
- Frontend source files analyzed: 65
- Backend API endpoints discovered: 82
- Backend models discovered: 16
- Backend controllers discovered: 15
- Frontend app routes discovered: 36

## 2. Dependencies and Runtime

### Backend Package (Backend/package.json)

- Name: smartdiet
- Version: 1.0.0
- Type: module
- Scripts (3): start, dev, jitsi:generate-token
- Dependencies (17): @google/generative-ai, axios, bcryptjs, cookie-parser, cors, dotenv, express, express-session, helmet, jsonwebtoken, mongoose, multer, nodemailer, openai, passport, passport-google-oauth20, stripe
- Dev Dependencies (1): nodemon

### Frontend Package (frontend/package.json)

- Name: dietara
- Version: 0.1.0
- Type: (not specified)
- Scripts (4): dev, build, start, lint
- Dependencies (9): axios, date-fns, framer-motion, lucide-react, next, react, react-dom, react-icons, react-toastify
- Dev Dependencies (8): @tailwindcss/postcss, @types/node, @types/react, @types/react-dom, eslint, eslint-config-next, tailwindcss, typescript

### Root Package (package.json)

- Name: (unknown)
- Version: (unknown)
- Type: (not specified)
- Scripts (0): none
- Dependencies (3): jsonwebtoken, react-easy-crop, uuid-random
- Dev Dependencies (0): none

## 3. Backend API Inventory

### Endpoint Table

| Method | Full Path | Route File | Handler | Middlewares |
|---|---|---|---|---|
| POST | /api/admin/foods | Backend/routes/foodRoutes.js | createFood | protect, allowRoles, foodUpload.single("image") |
| DELETE | /api/admin/foods/:id | Backend/routes/foodRoutes.js | deleteFood | protect, allowRoles |
| PUT | /api/admin/foods/:id | Backend/routes/foodRoutes.js | updateFood | protect, allowRoles, foodUpload.single("image") |
| GET | /api/admin/users | Backend/routes/adminRoutes.js | getAllUsers | protect, adminOnly |
| POST | /api/admin/users | Backend/routes/adminRoutes.js | createUser | protect, adminOnly |
| DELETE | /api/admin/users/:id | Backend/routes/adminRoutes.js | deleteUser | protect, adminOnly |
| GET | /api/admin/users/:id | Backend/routes/adminRoutes.js | getUser | protect, adminOnly |
| PUT | /api/admin/users/:id | Backend/routes/adminRoutes.js | updateUser | protect, adminOnly |
| POST | /api/ai/generate-diet-plan | Backend/routes/aiRoutes.js | <inline-handler> | upload.single("allergyReport") |
| POST | /api/appointments | Backend/routes/appointmentRoutes.js | createAppointment | protect |
| GET | /api/appointments/my | Backend/routes/appointmentRoutes.js | getMyAppointments | protect |
| DELETE | /api/auth/delete-account | Backend/routes/authRoutes.js | deleteAccountWithOtp | protect |
| POST | /api/auth/delete-account/send-otp | Backend/routes/authRoutes.js | sendDeleteAccountOtp | protect |
| POST | /api/auth/forgot-password | Backend/routes/authRoutes.js | forgotPassword | none |
| GET | /api/auth/google | Backend/routes/authRoutes.js | <inline-handler> | none |
| GET | /api/auth/google/callback | Backend/routes/authRoutes.js | <inline-handler> | none |
| POST | /api/auth/login | Backend/routes/authRoutes.js | login | none |
| POST | /api/auth/logout | Backend/routes/authRoutes.js | logout | none |
| GET | /api/auth/me | Backend/routes/authRoutes.js | getMe | protect |
| PUT | /api/auth/me | Backend/routes/authRoutes.js | updateMe | protect, avatarUpload.single("avatar") |
| POST | /api/auth/register | Backend/routes/authRoutes.js | register | none |
| POST | /api/auth/reset-password | Backend/routes/authRoutes.js | resetPassword | none |
| POST | /api/auth/verify-reset-otp | Backend/routes/authRoutes.js | verifyResetOtp | none |
| POST | /api/bookings | Backend/routes/bookingRoutes.js | createBooking | protect |
| PUT | /api/bookings/:bookingId/alert-seen | Backend/routes/bookingRoutes.js | markDieticianAlertSeen | protect, allowRoles |
| PUT | /api/bookings/:bookingId/approve | Backend/routes/bookingRoutes.js | approveBooking | protect, allowRoles |
| PUT | /api/bookings/:bookingId/pay | Backend/routes/bookingRoutes.js | markBookingPaid | protect |
| GET | /api/bookings/:bookingId/session | Backend/routes/bookingRoutes.js | getBookingCommunicationSession | protect, allowRoles |
| PUT | /api/bookings/admin/:bookingId | Backend/routes/bookingRoutes.js | updateBookingByAdmin | protect, allowRoles |
| GET | /api/bookings/admin/all | Backend/routes/bookingRoutes.js | getAllBookingsForAdmin | protect, allowRoles |
| GET | /api/bookings/dietician/my | Backend/routes/bookingRoutes.js | getDieticianBookings | protect, allowRoles |
| GET | /api/bookings/my | Backend/routes/bookingRoutes.js | getMyBookings | protect |
| GET | /api/bundle-offers | Backend/routes/bundleOfferRoutes.js | getActiveBundleOffers | none |
| GET | /api/bundle-offers/admin | Backend/routes/bundleOfferRoutes.js | getBundleOffersAdmin | protect, allowRoles |
| POST | /api/bundle-offers/admin | Backend/routes/bundleOfferRoutes.js | createBundleOffer | protect, allowRoles |
| DELETE | /api/bundle-offers/admin/:id | Backend/routes/bundleOfferRoutes.js | deleteBundleOffer | protect, allowRoles |
| PUT | /api/bundle-offers/admin/:id | Backend/routes/bundleOfferRoutes.js | updateBundleOffer | protect, allowRoles |
| GET | /api/categories | Backend/routes/categoryRoutes.js | getCategories | none |
| DELETE | /api/categories/:id | Backend/routes/categoryRoutes.js | deleteCategory | protect, adminOnly |
| PUT | /api/categories/:id | Backend/routes/categoryRoutes.js | updateCategory | protect, adminOnly |
| POST | /api/categories/create | Backend/routes/categoryRoutes.js | createCategory | protect, adminOnly |
| POST | /api/chat | Backend/routes/chatRoutes.js | sendMessage | protect |
| GET | /api/chat/:bookingId | Backend/routes/chatRoutes.js | getChat | protect |
| GET | /api/community/me/posts | Backend/routes/communityRoutes.js | getMyCommunityPosts | none |
| GET | /api/community/me/profile | Backend/routes/communityRoutes.js | getMyCommunityProfile | none |
| PUT | /api/community/me/profile | Backend/routes/communityRoutes.js | upsertMyCommunityProfile | communityUpload.single("coverImage") |
| POST | /api/community/network/connect/:targetUserId | Backend/routes/communityRoutes.js | connectNetworkUser | none |
| POST | /api/community/network/dismiss/:targetUserId | Backend/routes/communityRoutes.js | dismissNetworkSuggestion | none |
| GET | /api/community/network/suggestions | Backend/routes/communityRoutes.js | getNetworkSuggestions | none |
| GET | /api/community/posts | Backend/routes/communityRoutes.js | getCommunityFeed | none |
| POST | /api/community/posts | Backend/routes/communityRoutes.js | createCommunityPost | communityUpload.single("image") |
| DELETE | /api/community/posts/:postId | Backend/routes/communityRoutes.js | deleteCommunityPost | none |
| POST | /api/community/posts/:postId/like | Backend/routes/communityRoutes.js | toggleCommunityLike | none |
| GET | /api/contact/all | Backend/routes/contactRoutes.js | getContacts | none |
| POST | /api/contact/send | Backend/routes/contactRoutes.js | sendContact | none |
| GET | /api/dieticians | Backend/routes/dieticianRoutes.js | getDieticians | none |
| POST | /api/dieticians | Backend/routes/dieticianRoutes.js | createProfile | protect, allowRoles, uploadCert |
| PUT | /api/dieticians/admin/:profileId/approve | Backend/routes/dieticianRoutes.js | approveCertificate | protect, allowRoles |
| PUT | /api/dieticians/admin/:profileId/reject | Backend/routes/dieticianRoutes.js | rejectCertificate | protect, allowRoles |
| GET | /api/dieticians/admin/all | Backend/routes/dieticianRoutes.js | getAllDieticiansAdmin | protect, allowRoles |
| GET | /api/dieticians/me | Backend/routes/dieticianRoutes.js | getMyProfile | protect, allowRoles |
| GET | /api/foods | Backend/routes/foodRoutes.js | getFoods | none |
| GET | /api/kitchen/my-requests | Backend/routes/kitchenRequestRoutes.js | getMyKitchenRequests | protect, allowRoles |
| GET | /api/kitchen/requests | Backend/routes/kitchenRequestRoutes.js | getAllKitchenRequests | protect, allowRoles |
| POST | /api/kitchen/requests | Backend/routes/kitchenRequestRoutes.js | createKitchenRequest | protect, allowRoles, upload.single("allergyReport") |
| GET | /api/kitchen/requests/:id | Backend/routes/kitchenRequestRoutes.js | getKitchenRequestById | protect, allowRoles |
| PUT | /api/kitchen/requests/:id/cancel | Backend/routes/kitchenRequestRoutes.js | cancelMyKitchenRequest | protect, allowRoles |
| PUT | /api/kitchen/requests/:id/pay | Backend/routes/kitchenRequestRoutes.js | makePayment | protect, allowRoles |
| PUT | /api/kitchen/requests/:id/status | Backend/routes/kitchenRequestRoutes.js | updateKitchenRequestStatus | protect, allowRoles |
| POST | /api/newsletter/subscribe | Backend/routes/newsletterRoutes.js | <inline-handler> | none |
| PUT | /api/payments/orders/:orderId/status | Backend/routes/paymentRoutes.js | updateKitchenOrderStatus | protect, allowRoles |
| GET | /api/payments/orders/admin/all | Backend/routes/paymentRoutes.js | getAllKitchenOrders | protect, allowRoles |
| POST | /api/payments/orders/cash | Backend/routes/paymentRoutes.js | createCashOrder | protect, allowRoles |
| GET | /api/payments/orders/my | Backend/routes/paymentRoutes.js | getMyKitchenOrders | protect, allowRoles |
| GET | /api/payments/payment-methods | Backend/routes/paymentRoutes.js | getSavedCards | protect, allowRoles |
| DELETE | /api/payments/payment-methods/:id | Backend/routes/paymentRoutes.js | deleteSavedCard | protect, allowRoles |
| GET | /api/payments/stripe/confirm | Backend/routes/paymentRoutes.js | confirmCheckout | protect, allowRoles |
| GET | /api/payments/stripe/confirm-dietician | Backend/routes/paymentRoutes.js | confirmDieticianCheckout | protect, allowRoles |
| POST | /api/payments/stripe/create-checkout-session | Backend/routes/paymentRoutes.js | createCheckoutSession | protect, allowRoles |
| POST | /api/payments/stripe/create-dietician-checkout-session | Backend/routes/paymentRoutes.js | createDieticianCheckoutSession | protect, allowRoles |
| POST | /api/reviews | Backend/routes/reviewRoutes.js | submitReview | protect |
| GET | /api/reviews/:profileId | Backend/routes/reviewRoutes.js | getDieticianReviews | none |

### Endpoints Grouped by Route Module

#### Backend/routes/adminRoutes.js

- GET /api/admin/users -> getAllUsers
- POST /api/admin/users -> createUser
- DELETE /api/admin/users/:id -> deleteUser
- GET /api/admin/users/:id -> getUser
- PUT /api/admin/users/:id -> updateUser

#### Backend/routes/aiRoutes.js

- POST /api/ai/generate-diet-plan -> <inline-handler>

#### Backend/routes/appointmentRoutes.js

- POST /api/appointments -> createAppointment
- GET /api/appointments/my -> getMyAppointments

#### Backend/routes/authRoutes.js

- DELETE /api/auth/delete-account -> deleteAccountWithOtp
- POST /api/auth/delete-account/send-otp -> sendDeleteAccountOtp
- POST /api/auth/forgot-password -> forgotPassword
- GET /api/auth/google -> <inline-handler>
- GET /api/auth/google/callback -> <inline-handler>
- POST /api/auth/login -> login
- POST /api/auth/logout -> logout
- GET /api/auth/me -> getMe
- PUT /api/auth/me -> updateMe
- POST /api/auth/register -> register
- POST /api/auth/reset-password -> resetPassword
- POST /api/auth/verify-reset-otp -> verifyResetOtp

#### Backend/routes/bookingRoutes.js

- POST /api/bookings -> createBooking
- PUT /api/bookings/:bookingId/alert-seen -> markDieticianAlertSeen
- PUT /api/bookings/:bookingId/approve -> approveBooking
- PUT /api/bookings/:bookingId/pay -> markBookingPaid
- GET /api/bookings/:bookingId/session -> getBookingCommunicationSession
- PUT /api/bookings/admin/:bookingId -> updateBookingByAdmin
- GET /api/bookings/admin/all -> getAllBookingsForAdmin
- GET /api/bookings/dietician/my -> getDieticianBookings
- GET /api/bookings/my -> getMyBookings

#### Backend/routes/bundleOfferRoutes.js

- GET /api/bundle-offers -> getActiveBundleOffers
- GET /api/bundle-offers/admin -> getBundleOffersAdmin
- POST /api/bundle-offers/admin -> createBundleOffer
- DELETE /api/bundle-offers/admin/:id -> deleteBundleOffer
- PUT /api/bundle-offers/admin/:id -> updateBundleOffer

#### Backend/routes/categoryRoutes.js

- GET /api/categories -> getCategories
- DELETE /api/categories/:id -> deleteCategory
- PUT /api/categories/:id -> updateCategory
- POST /api/categories/create -> createCategory

#### Backend/routes/chatRoutes.js

- POST /api/chat -> sendMessage
- GET /api/chat/:bookingId -> getChat

#### Backend/routes/communityRoutes.js

- GET /api/community/me/posts -> getMyCommunityPosts
- GET /api/community/me/profile -> getMyCommunityProfile
- PUT /api/community/me/profile -> upsertMyCommunityProfile
- POST /api/community/network/connect/:targetUserId -> connectNetworkUser
- POST /api/community/network/dismiss/:targetUserId -> dismissNetworkSuggestion
- GET /api/community/network/suggestions -> getNetworkSuggestions
- GET /api/community/posts -> getCommunityFeed
- POST /api/community/posts -> createCommunityPost
- DELETE /api/community/posts/:postId -> deleteCommunityPost
- POST /api/community/posts/:postId/like -> toggleCommunityLike

#### Backend/routes/contactRoutes.js

- GET /api/contact/all -> getContacts
- POST /api/contact/send -> sendContact

#### Backend/routes/dieticianRoutes.js

- GET /api/dieticians -> getDieticians
- POST /api/dieticians -> createProfile
- PUT /api/dieticians/admin/:profileId/approve -> approveCertificate
- PUT /api/dieticians/admin/:profileId/reject -> rejectCertificate
- GET /api/dieticians/admin/all -> getAllDieticiansAdmin
- GET /api/dieticians/me -> getMyProfile

#### Backend/routes/foodRoutes.js

- POST /api/admin/foods -> createFood
- DELETE /api/admin/foods/:id -> deleteFood
- PUT /api/admin/foods/:id -> updateFood
- GET /api/foods -> getFoods

#### Backend/routes/kitchenRequestRoutes.js

- GET /api/kitchen/my-requests -> getMyKitchenRequests
- GET /api/kitchen/requests -> getAllKitchenRequests
- POST /api/kitchen/requests -> createKitchenRequest
- GET /api/kitchen/requests/:id -> getKitchenRequestById
- PUT /api/kitchen/requests/:id/cancel -> cancelMyKitchenRequest
- PUT /api/kitchen/requests/:id/pay -> makePayment
- PUT /api/kitchen/requests/:id/status -> updateKitchenRequestStatus

#### Backend/routes/newsletterRoutes.js

- POST /api/newsletter/subscribe -> <inline-handler>

#### Backend/routes/paymentRoutes.js

- PUT /api/payments/orders/:orderId/status -> updateKitchenOrderStatus
- GET /api/payments/orders/admin/all -> getAllKitchenOrders
- POST /api/payments/orders/cash -> createCashOrder
- GET /api/payments/orders/my -> getMyKitchenOrders
- GET /api/payments/payment-methods -> getSavedCards
- DELETE /api/payments/payment-methods/:id -> deleteSavedCard
- GET /api/payments/stripe/confirm -> confirmCheckout
- GET /api/payments/stripe/confirm-dietician -> confirmDieticianCheckout
- POST /api/payments/stripe/create-checkout-session -> createCheckoutSession
- POST /api/payments/stripe/create-dietician-checkout-session -> createDieticianCheckoutSession

#### Backend/routes/reviewRoutes.js

- POST /api/reviews -> submitReview
- GET /api/reviews/:profileId -> getDieticianReviews

## 4. Backend Function Inventory

### Controllers (Exported Functions)

- Backend/controllers/adminController.js: createUser, deleteUser, getAllUsers, getUser, updateUser
- Backend/controllers/aiController.js: chatWithAi, getAiSessionHistory, startAiSession
- Backend/controllers/appointmentController.js: createAppointment, getMyAppointments
- Backend/controllers/authController.js: deleteAccountWithOtp, forgotPassword, getMe, login, logout, register, resetPassword, sendDeleteAccountOtp, updateMe, verifyResetOtp
- Backend/controllers/bookingController.js: approveBooking, createBooking, getAllBookingsForAdmin, getBookingCommunicationSession, getDieticianBookings, getMyBookings, markBookingPaid, markDieticianAlertSeen, updateBookingByAdmin
- Backend/controllers/bundleOfferController.js: createBundleOffer, deleteBundleOffer, getActiveBundleOffers, getBundleOffersAdmin, updateBundleOffer
- Backend/controllers/categoryController.js: createCategory, deleteCategory, getCategories, updateCategory
- Backend/controllers/chatController.js: getChat, sendMessage
- Backend/controllers/communityController.js: connectNetworkUser, createCommunityPost, deleteCommunityPost, dismissNetworkSuggestion, getCommunityFeed, getMyCommunityPosts, getMyCommunityProfile, getNetworkSuggestions, toggleCommunityLike, upsertMyCommunityProfile
- Backend/controllers/contactController.js: getContacts, sendContact
- Backend/controllers/dieticianController.js: approveCertificate, createProfile, getAllDieticiansAdmin, getDieticians, getMyProfile, rejectCertificate
- Backend/controllers/foodController.js: createFood, deleteFood, getFoods, updateFood
- Backend/controllers/kitchenRequestController.js: cancelMyKitchenRequest, createKitchenRequest, getAllKitchenRequests, getKitchenRequestById, getMyKitchenRequests, makePayment, updateKitchenRequestStatus
- Backend/controllers/paymentController.js: confirmCheckout, confirmDieticianCheckout, createCashOrder, createCheckoutSession, createDieticianCheckoutSession, deleteSavedCard, getAllKitchenOrders, getMyKitchenOrders, getSavedCards, updateKitchenOrderStatus
- Backend/controllers/reviewController.js: getDieticianReviews, submitReview

### Middlewares (Exported Functions)

- Backend/middlewares/authMiddleware.js: adminOnly, protect
- Backend/middlewares/errorMiddleware.js: (no exported functions detected)
- Backend/middlewares/imageUpload.js: (no exported functions detected)
- Backend/middlewares/roleMiddleware.js: (no exported functions detected)
- Backend/middlewares/uploadMiddleware.js: (no exported functions detected)

### Services and Utils (Exported Functions)

- Backend/config/db.js: (no exported functions detected)
- Backend/config/passport.js: (no exported functions detected)
- Backend/services/bookingReminderService.js: startBookingReminderService, stopBookingReminderService
- Backend/utils/bookingSchedule.js: buildBookingTimingResponse, getBookingWindowState, parseBookingDateTime
- Backend/utils/generateToken.js: (no exported functions detected)
- Backend/utils/jitsiJwt.js: generate, generateFromEnv
- Backend/utils/sendEmail.js: (no exported functions detected)

## 5. Database Models (Mongoose)

### AiChatSession (Backend/models/AiChatSession.js)

- Top-level schema fields (2): content, role

### Appointment (Backend/models/Appointment.js)

- Top-level schema fields (4): date, dietician, time, user

### Booking (Backend/models/Booking.js)

- Top-level schema fields (14): date, dietician, dieticianAlertSeen, dieticianApproved, mode, paymentStatus, reminder30MinSentAt, reminder30MinSentToDietician, reminder30MinSentToUser, reviewSubmitted, sessionCompletedAt, status, time, user

### BundleOffer (Backend/models/BundleOffer.js)

- Top-level schema fields (5): allowedSizes, defaultQty, food, maxQty, minQty

### Category (Backend/models/Category.js)

- Top-level schema fields (1): name

### Chat (Backend/models/Chat.js)

- Top-level schema fields (3): booking, message, sender

### CommunityConnection (Backend/models/CommunityConnection.js)

- Top-level schema fields (3): requester, status, target

### CommunityPost (Backend/models/CommunityPost.js)

- Top-level schema fields (4): author, content, image, likes

### CommunityProfile (Backend/models/CommunityProfile.js)

- Top-level schema fields (9): bio, coverImage, dietFocus, displayName, isPublic, location, specialization, user, website

### Contact (Backend/models/contactModel.js)

- Top-level schema fields (4): email, isRead, message, name

### DieticianProfile (Backend/models/DieticianProfile.js)

- Top-level schema fields (14): availableSlots, avatar, bio, certificateStatus, certificateUrl, experience, isAvailable, isVerified, price, rating, rejectionReason, reviewCount, specialization, user

### Food (Backend/models/Food.js)

- Top-level schema fields (4): category, image, name, price

### KitchenOrder (Backend/models/KitchenOrder.js)

- Top-level schema fields (10): bundleDiscountPercent, bundleOffer, bundleOfferName, bundlePlanType, foodId, image, name, price, quantity, size

### KitchenRequest (Backend/models/KitchenRequest.js)

- Top-level schema fields (2): mealType, time

### Review (Backend/models/Review.js)

- Top-level schema fields (5): booking, comment, dietician, rating, user

### User (Backend/models/User.js)

- Top-level schema fields (16): avatar, email, googleId, isActive, isVerified, password, phone, resetOtpAttempts, resetOtpExpires, resetOtpHash, resetOtpLastSentAt, resetPasswordExpires, resetPasswordToken, role, savedCards, username

## 6. Frontend Route and UI Inventory

### App Router Pages (frontend/app/**/page.tsx)

- / (frontend/app/page.tsx)
- /ai-assistant (frontend/app/ai-assistant/page.tsx)
- /auth/google/callback (frontend/app/auth/google/callback/page.tsx)
- /call/[bookingId] (frontend/app/call/[bookingId]/page.tsx)
- /chat/[bookingId] (frontend/app/chat/[bookingId]/page.tsx)
- /checkout (frontend/app/checkout/page.tsx)
- /checkout/success (frontend/app/checkout/success/page.tsx)
- /community (frontend/app/community/page.tsx)
- /community/network (frontend/app/community/network/page.tsx)
- /community/profile (frontend/app/community/profile/page.tsx)
- /contact (frontend/app/contact/page.tsx)
- /dashboard (frontend/app/dashboard/page.tsx)
- /dashboard/admin (frontend/app/dashboard/admin/page.tsx)
- /dashboard/admin/analytics (frontend/app/dashboard/admin/analytics/page.tsx)
- /dashboard/admin/bundles (frontend/app/dashboard/admin/bundles/page.tsx)
- /dashboard/admin/dieticians (frontend/app/dashboard/admin/dieticians/page.tsx)
- /dashboard/admin/food (frontend/app/dashboard/admin/food/page.tsx)
- /dashboard/admin/notifications (frontend/app/dashboard/admin/notifications/page.tsx)
- /dashboard/admin/orders (frontend/app/dashboard/admin/orders/page.tsx)
- /dashboard/admin/users (frontend/app/dashboard/admin/users/page.tsx)
- /dashboard/dietician (frontend/app/dashboard/dietician/page.tsx)
- /dashboard/kitchen (frontend/app/dashboard/kitchen/page.tsx)
- /dashboard/messages (frontend/app/dashboard/messages/page.tsx)
- /dashboard/user (frontend/app/dashboard/user/page.tsx)
- /dietician (frontend/app/dietician/page.tsx)
- /forgot-password (frontend/app/forgot-password/page.tsx)
- /kitchen (frontend/app/kitchen/page.tsx)
- /login (frontend/app/login/page.tsx)
- /meal-tracking (frontend/app/meal-tracking/page.tsx)
- /payment/[bookingId] (frontend/app/payment/[bookingId]/page.tsx)
- /payment/success (frontend/app/payment/success/page.tsx)
- /pricing (frontend/app/pricing/page.tsx)
- /register (frontend/app/register/page.tsx)
- /reminder (frontend/app/reminder/page.tsx)
- /reset-password (frontend/app/reset-password/page.tsx)
- /tracking (frontend/app/tracking/page.tsx)

### Shared Components (frontend/components)

- frontend/components/AdminSidebar.tsx
- frontend/components/AppChrome.tsx
- frontend/components/AuthCard.tsx
- frontend/components/AuthModal.tsx
- frontend/components/BMICalculator.tsx
- frontend/components/BookingModal.tsx
- frontend/components/community/ImageCropModal.tsx
- frontend/components/FloatingAIAssistant.tsx
- frontend/components/Footer.tsx
- frontend/components/GlobalAuth.tsx
- frontend/components/Navbar.tsx
- frontend/components/NavigationLoader.tsx
- frontend/components/PageTransition.tsx
- frontend/components/ScrollReveal.tsx
- frontend/components/ServicesInteractive.tsx
- frontend/components/StarCursor.tsx

### Context / Lib / Types Files

- frontend/context/AuthContext.tsx
- frontend/lib/assetUrl.ts
- frontend/lib/axios.ts
- frontend/lib/bookingTiming.ts
- frontend/lib/imageCrop.ts
- frontend/types/auth.ts

## 7. Function Index (All Source Files)

### Backend Files

- Backend/config/db.js: connectDB
- Backend/config/passport.js: (none detected)
- Backend/controllers/adminController.js: createUser, deleteUser, getAllUsers, getUser, updateUser
- Backend/controllers/aiController.js: buildDeveloperPrompt, buildInitialPlan, chatWithAi, getAiSessionHistory, startAiSession
- Backend/controllers/appointmentController.js: createAppointment, getMyAppointments
- Backend/controllers/authController.js: deleteAccountWithOtp, forgotPassword, generateOtp, getMe, hashOtp, login, logout, normalizeRole, register, resetPassword, sendDeleteAccountOtp, toSafeUser, updateMe, verifyResetOtp
- Backend/controllers/bookingController.js: approveBooking, buildExternalRoomName, createBooking, formatDuration, getAllBookingsForAdmin, getBookingCommunicationSession, getDieticianBookings, getMyBookings, getWindowDeniedMessage, markBookingPaid, markDieticianAlertSeen, normalizeConsultationMode, sendCustomerApprovalAlert, sendDieticianPaidBookingAlert, updateBookingByAdmin
- Backend/controllers/bundleOfferController.js: createBundleOffer, deleteBundleOffer, getActiveBundleOffers, getBundleOffersAdmin, normalizeItems, toBoolean, updateBundleOffer
- Backend/controllers/categoryController.js: createCategory, deleteCategory, escapeRegex, findCategoryByName, getCategories, normalizeCategoryName, updateCategory
- Backend/controllers/chatController.js: ensureBookingAccess, getChat, normalizeRole, sendMessage
- Backend/controllers/communityController.js: buildHeadline, connectNetworkUser, createCommunityPost, deleteCommunityPost, dismissNetworkSuggestion, getCommunityFeed, getMyCommunityPosts, getMyCommunityProfile, getNetworkSuggestions, parsePagination, toCommunityUser, toggleCommunityLike, toNetworkPayload, toPostPayload, toProfilePayload, upsertMyCommunityProfile
- Backend/controllers/contactController.js: getContacts, sendContact
- Backend/controllers/dieticianController.js: approveCertificate, createProfile, fileFilter, getAllDieticiansAdmin, getDieticians, getMyProfile, rejectCertificate
- Backend/controllers/foodController.js: buildImagePath, createFood, deleteFood, getFoods, updateFood
- Backend/controllers/kitchenRequestController.js: cancelMyKitchenRequest, createKitchenRequest, getAllKitchenRequests, getKitchenRequestById, getMyKitchenRequests, makePayment, parseArrayField, parsePreferredMealTimes, updateKitchenRequestStatus
- Backend/controllers/paymentController.js: buildDieticianLineItems, buildLineItems, buildPaymentSummary, confirmCheckout, confirmDieticianCheckout, createCashOrder, createCheckoutSession, createDieticianCheckoutSession, createHttpError, deleteSavedCard, getAllKitchenOrders, getMyKitchenOrders, getSavedCards, normalizeConsultationMode, normalizeOrderItems, resolveDieticianPricing, resolveServiceFeeByMode, sendDieticianPaidBookingAlert, updateKitchenOrderStatus
- Backend/controllers/reviewController.js: getDieticianReviews, submitReview
- Backend/middlewares/authMiddleware.js: adminOnly, normalizeRole, protect
- Backend/middlewares/errorMiddleware.js: (none detected)
- Backend/middlewares/imageUpload.js: createImageUploader, ensureDir, fileFilter
- Backend/middlewares/roleMiddleware.js: allowRoles, normalizeRole
- Backend/middlewares/uploadMiddleware.js: fileFilter
- Backend/models/AiChatSession.js: (none detected)
- Backend/models/Appointment.js: (none detected)
- Backend/models/Booking.js: (none detected)
- Backend/models/BundleOffer.js: (none detected)
- Backend/models/Category.js: (none detected)
- Backend/models/Chat.js: (none detected)
- Backend/models/CommunityConnection.js: (none detected)
- Backend/models/CommunityPost.js: (none detected)
- Backend/models/CommunityProfile.js: (none detected)
- Backend/models/contactModel.js: (none detected)
- Backend/models/DieticianProfile.js: (none detected)
- Backend/models/Food.js: (none detected)
- Backend/models/KitchenOrder.js: (none detected)
- Backend/models/KitchenRequest.js: (none detected)
- Backend/models/Review.js: (none detected)
- Backend/models/User.js: (none detected)
- Backend/routes/adminRoutes.js: (none detected)
- Backend/routes/aiRoutes.js: (none detected)
- Backend/routes/appointmentRoutes.js: (none detected)
- Backend/routes/authRoutes.js: buildOAuthFailureUrl, getAllowedFrontendOrigins, mapOAuthErrorReason, normalizeOrigin, resolveFrontendOrigin
- Backend/routes/bookingRoutes.js: (none detected)
- Backend/routes/bundleOfferRoutes.js: (none detected)
- Backend/routes/categoryRoutes.js: (none detected)
- Backend/routes/chatRoutes.js: (none detected)
- Backend/routes/communityRoutes.js: (none detected)
- Backend/routes/contactRoutes.js: (none detected)
- Backend/routes/dieticianRoutes.js: (none detected)
- Backend/routes/foodRoutes.js: (none detected)
- Backend/routes/kitchenRequestRoutes.js: (none detected)
- Backend/routes/newsletterRoutes.js: (none detected)
- Backend/routes/paymentRoutes.js: (none detected)
- Backend/routes/reviewRoutes.js: (none detected)
- Backend/scripts/generateJitsiJwt.js: (none detected)
- Backend/server.js: (none detected)
- Backend/services/bookingReminderService.js: processBooking, runReminderTick, sendDieticianReminderEmail, sendUserReminderEmail, shouldSendReminderNow, startBookingReminderService, stopBookingReminderService
- Backend/utils/bookingSchedule.js: buildBookingTimingResponse, getBookingWindowState, isValidDate, parseBookingDateTime, parseDateParts, parseTimeParts
- Backend/utils/generateToken.js: generateToken
- Backend/utils/jitsiJwt.js: buildRoomClaim, generate, generateFromEnv, normalizePrivateKey, toBool
- Backend/utils/sendEmail.js: sendEmail

### Frontend Files

- frontend/app/ai-assistant/page.tsx: AIDietAssistantPage, askNextQuestion, buildFinalPayload, generateDietPlan, handleAnswer, handleMultiSelectLikeFoods, handleSkipReport, handleUploadReport, pushAiMessage, pushUserMessage, validateInputForQuestion
- frontend/app/auth/google/callback/page.tsx: completeAuth, getPostAuthRedirectPath, GoogleAuthCallbackPage
- frontend/app/call/[bookingId]/page.tsx: bootstrap, CallPage, endCall, enforceIframeSizing, ensureJitsiScript, normalizeJitsiDomain, toggleAudio, toggleVideo
- frontend/app/chat/[bookingId]/page.tsx: bootstrap, ChatPage, enforceIframeSizing, ensureJitsiScript, normalizeJitsiDomain, reopenChatPanel
- frontend/app/checkout/page.tsx: CheckoutPage, getApiErrorMessage, handlePay
- frontend/app/checkout/success/page.tsx: CheckoutSuccessPage
- frontend/app/community/network/page.tsx: CommunityNetworkPage, getErrorMessage, handleConnect, handleDismiss, loadSuggestions, roleLabel, SuggestionCard, toInitial
- frontend/app/community/page.tsx: CommunityPage, createPost, deletePost, getErrorMessage, handlePostCropApply, handlePostCropCancel, handlePostImageSelect, handleTopicClick, loadCommunityData, roleLabel, toggleLike, toInitial
- frontend/app/community/profile/page.tsx: CommunityProfilePage, deletePost, getErrorMessage, handleCoverCropApply, handleCoverCropCancel, handleCoverImageSelect, loadProfileData, roleLabel, saveSettings, syncFormFromProfile, toggleLike, toInitial
- frontend/app/contact/page.tsx: ContactPage, sendMessage
- frontend/app/dashboard/admin/analytics/page.tsx: AnalyticsPage
- frontend/app/dashboard/admin/bundles/page.tsx: BundleOfferPage, fetchFoods, fetchOffers, handleDelete, handleEdit, handleSave, load, resetForm, toggleSize, updateItem
- frontend/app/dashboard/admin/dieticians/page.tsx: AdminDieticiansPage, handleApprove, handleReject, statusBadge
- frontend/app/dashboard/admin/food/page.tsx: closeCategoryModal, closeFoodModal, deleteCategory, deleteFood, fetchCategories, fetchFoods, FoodPage, getApiErrorMessage, openCategoryModal, openFoodModal, resetCategoryCreateForm, resetFoodCreateForm, resolveImage, saveCategory, saveCategoryEdit, saveFood, saveFoodEdit
- frontend/app/dashboard/admin/layout.tsx: AdminLayout, handleSearch
- frontend/app/dashboard/admin/notifications/page.tsx: NotificationsPage
- frontend/app/dashboard/admin/orders/page.tsx: fetchData, OrdersPage, updateBookingStatus, updateOrderStatus
- frontend/app/dashboard/admin/page.tsx: AdminDashboard, fetchSummary
- frontend/app/dashboard/admin/users/page.tsx: AdminUsersPage, fetchUsers, handleDeleteUser, handleUpdateRole
- frontend/app/dashboard/dietician/page.tsx: certStatusInfo, DieticianDashboard, fetchBookings, fetchProfile, getBookingTimeState, getModeMeta, handleAccountSave, handleApprove, handleAvatarChange, handleDeleteAccount, handleProfileSubmit, handleRemoveAvatarClick, handleResetPassword, handleSearchSubmit, handleSendDeleteOtp, handleSendOtp, isCallMode, isChatMode, normalizeConsultationMode, normalizeRole, resolveAvatar
- frontend/app/dashboard/kitchen/page.tsx: deleteAccount, fetchKitchenOrders, getApiErrorMessage, handleProfileImageChange, handleRemoveAvatarClick, KitchenDashboardPage, resetPassword, saveProfile, sendDeleteOtp, sendResetOtp, updateOrderStatus
- frontend/app/dashboard/messages/page.tsx: AdminMessages
- frontend/app/dashboard/page.tsx: DashboardPage, fetchAppointments
- frontend/app/dashboard/user/page.tsx: confirmDeleteAccount, deleteCard, fetchBookings, fetchKitchenOrders, fetchSavedCards, getBookingTimeState, handleProfileImageChange, handleRemoveAvatarClick, handleSearchSubmit, handleSubmit, isCallMode, isChatMode, normalizeConsultationMode, RatingModal, resolveAvatar, saveProfile, sendDeleteOtp, sendResetOtp, submitPasswordReset, UserDashboard
- frontend/app/dietician/page.tsx: DieticianPage, fetchDieticians, handleBook, StarRating
- frontend/app/forgot-password/page.tsx: ForgotPasswordPage, getApiErrorMessage, handleSubmit
- frontend/app/kitchen/page.tsx: addBundleToCart, addToCart, clearCart, closeFoodsModal, decreaseQty, fetchBundleOffers, fetchCategories, getCartKey, getImageUrl, increaseQty, KitchenPage, openBundleModal, openFoodsModal, removeItem, toggleCartModal
- frontend/app/layout.tsx: RootLayout
- frontend/app/loading.tsx: Loading
- frontend/app/login/page.tsx: LoginPage
- frontend/app/meal-tracking/page.tsx: MealTrackingPage
- frontend/app/page.tsx: handleBook, HomePage, StarRating
- frontend/app/payment/[bookingId]/page.tsx: getApiErrorMessage, handlePayment, PaymentPage
- frontend/app/payment/success/page.tsx: confirm, formatDateTime, formatMoney, getApiErrorMessage, PaymentSuccessPage
- frontend/app/pricing/page.tsx: FeatureValue, formatPrice, handlePlanSelect, PricingPage
- frontend/app/register/page.tsx: RegisterPage
- frontend/app/reminder/page.tsx: checkNow, handleDrinkWater, handleMealTimeChange, handleResetWater, handleWeightUpdate, markMealDone, markMealMissed, mealStatusDotClass, mealStatusPillClass, playSound, ReminderPage, requestNotificationPermission, showBrowserNotification, triggerAlert
- frontend/app/reset-password/page.tsx: getApiErrorMessage, handleSubmit, ResetPasswordPage
- frontend/app/tracking/page.tsx: TrackingPage
- frontend/components/AdminSidebar.tsx: AdminSidebar
- frontend/components/AppChrome.tsx: AppChrome, shouldHideMainChrome
- frontend/components/AuthCard.tsx: AuthCard, clearMessages, closeResetFlow, getApiErrorMessage, handleGoogleSignIn, handleLoginChange, handleLoginSubmit, handleRegisterChange, handleRegisterSubmit, handleRequestOtp, handleResetChange, handleResetPasswordSubmit, handleResetSubmit, handleVerifyOtp, openResetFlow
- frontend/components/AuthModal.tsx: AuthModal, handleEsc
- frontend/components/BMICalculator.tsx: BMICalculator, handleReset
- frontend/components/BookingModal.tsx: BookingModal, getApiErrorMessage, getDayName, getModeMeta, handlePaymentSubmit, handleScheduleNext, modalNode
- frontend/components/community/ImageCropModal.tsx: handleApply, ImageCropModal
- frontend/components/FloatingAIAssistant.tsx: FloatingAIAssistant, handleOpenAssistant, handleScrollTop, onScroll
- frontend/components/Footer.tsx: Footer, handleSubscribe
- frontend/components/GlobalAuth.tsx: GlobalAuth
- frontend/components/Navbar.tsx: clearServicesCloseTimer, closeServicesMenu, getDashboardHref, loadActions, Navbar, openServicesMenu, toTimeLabel, toTimestamp
- frontend/components/NavigationLoader.tsx: NavigationLoader
- frontend/components/PageTransition.tsx: PageTransition
- frontend/components/ScrollReveal.tsx: bindTargets, collectTargets, revealElements, ScrollReveal
- frontend/components/ServicesInteractive.tsx: handleServiceOpen, ServicesInteractive
- frontend/components/StarCursor.tsx: createStar, move, StarCursor
- frontend/context/AuthContext.tsx: AuthProvider, closeLogin, getPostAuthRedirectPath, logout, openLogin, setAuthUser, useAuth
- frontend/eslint.config.mjs: (none detected)
- frontend/lib/assetUrl.ts: resolveBackendAssetUrl
- frontend/lib/axios.ts: (none detected)
- frontend/lib/bookingTiming.ts: formatDuration, getBookingTimeMeta, getBookingTimingMessage, parseBookingDateTime, parseDateParts, parseTimeParts, toIsoOrNull
- frontend/lib/imageCrop.ts: cropImageToFile
- frontend/next-env.d.ts: (none detected)
- frontend/next.config.ts: (none detected)
- frontend/postcss.config.mjs: (none detected)
- frontend/types/auth.ts: (none detected)

## 8. Project Structure Summary

### Backend High-Level Modules

- config (2 files)
- controllers (15 files)
- middlewares (5 files)
- models (16 files)
- routes (16 files)
- scripts (1 files)
- server.js (1 files)
- services (1 files)
- utils (4 files)

### Frontend High-Level Modules

- app (39 files)
- components (16 files)
- context (1 files)
- eslint.config.mjs (1 files)
- lib (4 files)
- next-env.d.ts (1 files)
- next.config.ts (1 files)
- postcss.config.mjs (1 files)
- types (1 files)

## 9. Notes

- This summary is generated by static analysis and regex parsing.
- If route/function declarations use unusual dynamic patterns, some entries may appear as unknown or inline handlers.
- PDF is generated from this markdown snapshot.
