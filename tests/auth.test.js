import { describe, it, expect, beforeEach } from "vitest";
import { POST as signUpPost } from "../src/app/api/auth/signup/route.js";
import { POST as signInPost } from "../src/app/api/auth/signin/route.js";
import { GET as profileGet, PUT as profilePut } from "../src/app/api/user/profile/route.js";
import { POST as signOutPost } from "../src/app/api/auth/signout/route.js";

describe("User Authentication & Profile API", () => {
  const testEmail = `test_student_${Date.now()}@college.edu.in`;
  const testPassword = "securePassword123";
  let sessionToken = null;

  it("1. Successfully registers a user and stores basic info & location in JSON format", async () => {
    const signupPayload = {
      email: testEmail,
      password: testPassword,
      name: "Rohan Varma",
      age: 21,
      classLevel: "College 3rd Year",
      highestEducation: "Undergraduate (B.Tech / B.E.)",
      institution: "BITS Pilani",
      stream: "Computer Science",
      city: "Hyderabad",
      state: "Telangana",
      pincode: "500032",
      country: "India",
      aspirations: "Aiming for Artificial Intelligence and Product Engineering roles.",
    };

    const req = new Request("http://localhost:3000/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(signupPayload),
    });

    const res = await signUpPost(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.user).toBeDefined();
    expect(json.user.email).toBe(testEmail.toLowerCase());
    expect(json.user.profile.name).toBe("Rohan Varma");
    expect(json.user.profile.age).toBe(21);
    expect(json.user.profile.classLevel).toBe("College 3rd Year");
    expect(json.user.profile.institution).toBe("BITS Pilani");
    expect(json.user.profile.stream).toBe("Computer Science");
    expect(json.user.profile.address.city).toBe("Hyderabad");
    expect(json.user.profile.address.state).toBe("Telangana");
    expect(json.user.profile.aspirations).toContain("Artificial Intelligence");

    // Check session cookie
    const cookieHeader = res.headers.get("set-cookie");
    expect(cookieHeader).toContain("career_compass_session");
    sessionToken = json.token;
  });

  it("2. Rejects duplicate registration with same email", async () => {
    const req = new Request("http://localhost:3000/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        password: "anotherPassword",
      }),
    });

    const res = await signUpPost(req);
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.error).toContain("already exists");
  });

  it("3. Successfully signs in with correct credentials and returns profile data as it is", async () => {
    const req = new Request("http://localhost:3000/api/auth/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
      }),
    });

    const res = await signInPost(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.user.profile.name).toBe("Rohan Varma");
    expect(json.user.profile.age).toBe(21);
    expect(json.user.profile.institution).toBe("BITS Pilani");
    expect(json.user.profile.address.city).toBe("Hyderabad");
    expect(json.user.profile.address.state).toBe("Telangana");
    expect(json.token).toBeDefined();
    sessionToken = json.token;
  });

  it("4. Rejects signin with invalid password", async () => {
    const req = new Request("http://localhost:3000/api/auth/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        password: "wrongPassword!",
      }),
    });

    const res = await signInPost(req);
    expect(res.status).toBe(401);
  });

  it("5. Updates user profile via PUT /api/user/profile and stores updated JSON in database", async () => {
    const updatePayload = {
      name: "Rohan K. Varma",
      age: 22,
      classLevel: "College 4th Year (Final Year)",
      highestEducation: "Undergraduate (B.Tech / B.E.)",
      institution: "BITS Pilani, Goa Campus",
      stream: "AI & Data Science",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560001",
      country: "India",
      aspirations: "Founding a tech startup in generative AI.",
    };

    const req = new Request("http://localhost:3000/api/user/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sessionToken}`,
      },
      body: JSON.stringify(updatePayload),
    });

    const res = await profilePut(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.profile.name).toBe("Rohan K. Varma");
    expect(json.profile.age).toBe(22);
    expect(json.profile.classLevel).toBe("College 4th Year (Final Year)");
    expect(json.profile.stream).toBe("AI & Data Science");
    expect(json.profile.address.city).toBe("Bengaluru");
    expect(json.profile.address.state).toBe("Karnataka");
    expect(json.profile.aspirations).toContain("Founding a tech startup");
  });

  it("6. Next time user signs in, his data is restored as it is from the database", async () => {
    const req = new Request("http://localhost:3000/api/auth/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
      }),
    });

    const res = await signInPost(req);
    const json = await res.json();

    expect(json.ok).toBe(true);
    // Verifies data was updated and preserved exactly as it is
    expect(json.user.profile.name).toBe("Rohan K. Varma");
    expect(json.user.profile.age).toBe(22);
    expect(json.user.profile.classLevel).toBe("College 4th Year (Final Year)");
    expect(json.user.profile.stream).toBe("AI & Data Science");
    expect(json.user.profile.address.city).toBe("Bengaluru");
    expect(json.user.profile.address.state).toBe("Karnataka");
    expect(json.user.profile.aspirations).toBe("Founding a tech startup in generative AI.");
  });

  it("7. Signs out and invalidates session", async () => {
    const req = new Request("http://localhost:3000/api/auth/signout", {
      method: "POST",
      headers: { Authorization: `Bearer ${sessionToken}` },
    });

    const res = await signOutPost(req);
    expect(res.status).toBe(200);

    // Profile request after signout must fail
    const getReq = new Request("http://localhost:3000/api/user/profile", {
      method: "GET",
      headers: { Authorization: `Bearer ${sessionToken}` },
    });
    const getRes = await profileGet(getReq);
    expect(getRes.status).toBe(401);
  });
});
