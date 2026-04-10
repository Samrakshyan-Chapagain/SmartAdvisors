import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Layout from './components/Layout';
import DisclaimerModal from './components/DisclaimerModal';
import WelcomePage from './components/WelcomePage';
import SignInOverlay from './components/SignInOverlay';
import type { GoogleUser } from './components/SignInOverlay';
import UploadScreen from './components/UploadScreen';
import TranscriptReview from './components/TranscriptReview';
import type { Preferences } from './components/PreferenceForm';
import ProfessorPreferencesOnboarding, {
  onboardingSelectionsToPreferences,
} from './components/ProfessorPreferencesOnboarding';
import ProcessingOverlay from './components/ProcessingOverlay';
import YourRecommendations from './components/YourRecommendations';
import DegreePlanSetup from './components/DegreePlanSetup';
import SemesterPlanView from './components/SemesterPlanView';
import DashboardLayout from './components/DashboardLayout';
import DashboardPage from './components/DashboardPage';
import { getDegreeName, getCollegeName } from './config/colleges';
import PlanDegreePage from './components/PlanDegreePage';
import type { DegreePlan, Course, ElectiveCourse, ElectiveGroup, Student } from './types/PlanDegreePage';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

// link to run locally: http://localhost:5173/

const STORAGE_KEY = (email: string) => `sa_plan_${email}`;

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = 30000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(timer));
}

interface ApiRecommendationResponse {
  success: boolean;
  recommendations: any[];
  electiveRecommendations?: any[];
  electiveGroups?: { group: string; hoursRequired: number; hoursCompleted: number }[];
  stats?: any;
}

/*
  Step flow:
  0  = WelcomePage  (Guest + Sign In buttons)
  0.5 = LoginPage   (SSO wireframe, only if "Sign In" clicked)
  1  = UploadScreen
  2  = TranscriptReview
  --- branches here ---
  Guest:     3 = ProfessorPreferencesOnboarding → 4 = YourRecommendations (demo UI; API data still in apiData)
  Logged-in: 3 = ProfessorPreferencesOnboarding (prefs) → 3 = DegreePlanSetup (when prefs set) → 4 = SemesterPlanView
  Returning: Sign In → 4 = WelcomeBack dashboard → SemesterPlanView
*/

function App({ googleOAuthEnabled = true }: { googleOAuthEnabled?: boolean }) {
  const emptyPreferences: Preferences = {
    extraCredit: false,
    clearGrading: false,
    goodFeedback: false,
    caring: false,
    lectureHeavy: false,
    groupProjects: false,
    avoidTestHeavy: false,
    avoidHomeworkHeavy: false,
    avoidStrictAttendance: false,
    avoidPopQuizzes: false,
  };
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [step, setStep] = useState<number>(0);
  const [showLogin, setShowLogin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [googleUser, setGoogleUser] = useState<GoogleUser | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [department, setDepartment] = useState<string>('');
  const [completedCourses, setCompletedCourses] = useState<string[]>([]);
  const [inProgressCourses, setInProgressCourses] = useState<string[]>([]);
  const [apiData, setApiData] = useState<ApiRecommendationResponse | null>(null);
  const [userPrefs, setUserPrefs] = useState<Preferences | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [degreePlan, setDegreePlan] = useState<any>(null);
  const [isReturningUser, setIsReturningUser] = useState(false);
  const usePlanDegreePage = true; // Toggle for new UI (set to false to use old DegreePlanSetup)
  const [planDegreeData, setPlanDegreeData] = useState<{
    student: Student | undefined;
    requiredCourses: Course[];
    electiveCourses: ElectiveCourse[];
    electiveGroups: ElectiveGroup[];
  }>({
    student: undefined,
    requiredCourses: [],
    electiveCourses: [],
    electiveGroups: [],
  });
  const [enteredViaOverlay, setEnteredViaOverlay] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [step, showLogin]);

  // Reset plan degree data whenever the user navigates away from step 3
  // so stale data from a different department/transcript doesn't linger.
  useEffect(() => {
    if (step !== 3) {
      setPlanDegreeData({ student: undefined, requiredCourses: [], electiveCourses: [], electiveGroups: [] });
    }
  }, [step]);

  useEffect(() => {
    const shouldPreloadPlanData =
      step === 3 &&
      isLoggedIn &&
      usePlanDegreePage &&
      Boolean(userPrefs) &&
      !isLoading &&
      planDegreeData.requiredCourses.length === 0 &&
      planDegreeData.electiveCourses.length === 0;

    if (shouldPreloadPlanData) {
      fetchPlanDegreeData();
    }
  }, [step, isLoggedIn, userPrefs, isLoading, planDegreeData.requiredCourses.length, planDegreeData.electiveCourses.length]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUploadAndParse = async () => {
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      alert('File too large. Please upload a PDF under 5 MB.');
      return;
    }
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      alert('Please upload a PDF file.');
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append('transcript', file);

    try {
      const response = await fetchWithTimeout(`${API_URL}/api/parse-transcript`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();

      if (response.ok && data.courses) {
        setCompletedCourses(data.courses);
        setInProgressCourses(data.inProgressCourses || []);
        setStep(2);
      } else {
        alert(data.error || 'Error parsing transcript.');
      }
    } catch (error: any) {
      if (error?.name === 'AbortError') {
        alert('Request timed out. Please try again.');
      } else {
        alert('Could not connect to server. Is the backend running?');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Guest flow: preferences → recommendations
  const handleGenerate = async (preferences: Preferences) => {
    setUserPrefs(preferences);
    setIsLoading(true);

    const formData = new FormData();
    formData.append('completed_courses', JSON.stringify(completedCourses));
    formData.append('in_progress_courses', JSON.stringify(inProgressCourses));
    formData.append('department', department);
    formData.append('preferences', JSON.stringify(preferences));

    try {
      const response = await fetchWithTimeout(`${API_URL}/api/recommendations`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        setApiData(data);
        setStep(4);
      } else {
        alert(data.error || 'Could not generate recommendations.');
      }
    } catch (error: any) {
      if (error?.name === 'AbortError') {
        alert('Request timed out. Please try again.');
      } else {
        alert('Could not connect to server. Is the backend running?');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Logged-in flow: degree plan generation
  const handleGenerateDegreePlan = async (
    creditsPerSemester: number,
    selectedCourses: string[],
    startSemester: string,
    startYear: number,
    includeSummer: boolean,
    chosenElectives: string[]
  ) => {
    setIsLoading(true);

    try {
      const response = await fetchWithTimeout(`${API_URL}/api/degree-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          completed_courses: completedCourses,
          in_progress_courses: inProgressCourses,
          department,
          credits_per_semester: creditsPerSemester,
          selected_next_semester: selectedCourses,
          start_semester: startSemester,
          start_year: startYear,
          include_summer: includeSummer,
          chosen_electives: chosenElectives,
          preferences: userPrefs,
        }),
      }, 60000); // degree plans can take longer
      const data = await response.json();
      if (response.ok && data.success) {
        setDegreePlan(data);
        setStep(4);
        // Save plan to localStorage so returning users skip the upload flow
        if (googleUser) {
          try {
            localStorage.setItem(STORAGE_KEY(googleUser.email), JSON.stringify({
              completedCourses,
              inProgressCourses,
              department,
              userPrefs,
              degreePlan: data,
            }));
          } catch {
            // localStorage quota exceeded — continue without persisting
          }
        }
      } else {
        alert(data.error || 'Could not generate degree plan.');
      }
    } catch (error: any) {
      if (error?.name === 'AbortError') {
        alert('Request timed out. Please try again.');
      } else {
        alert('Could not connect to server. Is the backend running?');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for PlanDegreePage completion
  const handlePlanDegreeComplete = async (plan: DegreePlan) => {
    await handleGenerateDegreePlan(
      plan.maxHoursPerSemester,
      plan.selectedCourseIds,
      plan.season,
      parseInt(plan.year),
      plan.includeSummer,
      plan.chosenElectiveIds
    );
  };

  // Fetch data for PlanDegreePage
  const fetchPlanDegreeData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/degree-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          completed_courses: completedCourses,
          in_progress_courses: inProgressCourses,
          department,
          credits_per_semester: 15, // Default value for initial fetch
        }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        // Transform API data to PlanDegreePage format
        const requiredCourses: Course[] = (data.eligibleCourses || [])
          .filter((c: any) => c.requirement === 'required')
          .map((c: any) => ({
            id: c.code,
            code: c.code,
            name: c.name,
            creditHours: c.creditHours
          }));

        // Build group lookup from electiveGroups so flat list knows its groups
        const groupLookup: Record<string, string[]> = {};
        for (const g of (data.electiveGroups || [])) {
          for (const c of (g.courses || [])) {
            groupLookup[c.code] = [...(groupLookup[c.code] || []), g.group];
          }
        }

        const electiveSource = data.allElectives || data.eligibleCourses?.filter((c: any) => c.requirement === 'elective') || [];
        const electiveCourses: ElectiveCourse[] = electiveSource.map((c: any) => ({
          id: c.code,
          code: c.code,
          name: c.name,
          creditHours: c.creditHours,
          missingPrereqs: c.missingPrereqs || [],
          group: groupLookup[c.code]?.[0] || undefined,
          groups: groupLookup[c.code] || c.groups || [],
          isEligible: c.isEligible ?? (c.missingPrereqs || []).length === 0,
          ...(c.taken ? { taken: true } : {}),
        }));

        // Preserve elective groups with hour requirements from API
        const electiveGroups: ElectiveGroup[] = (data.electiveGroups || []).map((g: any) => ({
          group: g.group,
          hoursRequired: g.hoursRequired,
          hoursCompleted: g.hoursCompleted,
          courses: (g.courses || []).map((c: any) => ({
            id: c.code,
            code: c.code,
            name: c.name,
            creditHours: c.creditHours,
            missingPrereqs: c.missingPrereqs || [],
            group: g.group,
            groups: c.groups || [g.group],
            isEligible: c.isEligible ?? (c.missingPrereqs || []).length === 0,
            ...(c.taken ? { taken: true } : {}),
          })),
        }));

        const remHrs = Math.max(0, (data.stats.totalHours || 0) - (data.stats.completedHours || 0));
        const student: Student | undefined = data.stats
          ? {
              name: googleUser?.name || 'Student',
              completedCourses: [...completedCourses],
              completedCourseCount: data.stats.completedCourses || 0,
              completedCreditHours: data.stats.completedHours || 0,
              totalCreditHours: data.stats.totalHours || 0,
              totalCoursesRequired: data.stats.totalCourses || 0,
              estimatedSemestersLeft: remHrs > 0 ? Math.max(1, Math.ceil(remHrs / 15)) : 0,
            }
          : undefined;

        setPlanDegreeData({
          student,
          requiredCourses,
          electiveCourses,
          electiveGroups,
        });
      }
    } catch (error) {
      console.error('Failed to fetch plan degree data:', error);
      alert("Could not connect to server.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoClick = () => {
    // If logged in with a plan, go to WelcomeBack dashboard
    if (isLoggedIn && degreePlan && googleUser) {
      setIsReturningUser(true);
      setStep(4);
      return;
    }
    // Otherwise, go to landing page
    setStep(0);
    setShowLogin(false);
    setIsLoggedIn(false);
    setIsReturningUser(false);
    setGoogleUser(null);
    setDegreePlan(null);
    setCompletedCourses([]);
    setInProgressCourses([]);
    setFile(null);
    setUserPrefs(null);
  };

  const handleSignOut = () => {
    setStep(0);
    setShowLogin(false);
    setIsLoggedIn(false);
    setIsReturningUser(false);
    setGoogleUser(null);
    setDegreePlan(null);
    setCompletedCourses([]);
    setInProgressCourses([]);
    setFile(null);
    setUserPrefs(null);
  };

  const handleEditPlan = () => {
    setIsReturningUser(false);
    setUserPrefs((prev) => prev || emptyPreferences);
    setStep(3);
  };


  const handleNewTranscript = () => {
    if (googleUser) localStorage.removeItem(STORAGE_KEY(googleUser.email));
    setIsReturningUser(false);
    setDegreePlan(null);
    setCompletedCourses([]);
    setInProgressCourses([]);
    setFile(null);
    setUserPrefs(null);
    setStep(1);
  };

  // --- Disclaimer overlay (blocks everything) ---
  if (!disclaimerAccepted) {
    return <DisclaimerModal onAccept={() => setDisclaimerAccepted(true)} />;
  }

  // --- Main step flow ---
  if (step === 0) {
    const handleLogin = (user: GoogleUser) => {
      const savedRaw = localStorage.getItem(STORAGE_KEY(user.email));
      if (savedRaw) {
        try {
          const saved = JSON.parse(savedRaw);
          // Validate that saved plan data is usable
          if (saved.degreePlan && Array.isArray(saved.degreePlan.plan) && saved.degreePlan.stats) {
            setCompletedCourses(saved.completedCourses || []);
            setInProgressCourses(saved.inProgressCourses || []);
            setDepartment(saved.department || '');
            setUserPrefs(saved.userPrefs || null);
            setDegreePlan(saved.degreePlan);
            setGoogleUser(user);
            setIsLoggedIn(true);
            setIsReturningUser(true);
            setShowLogin(false);
            setStep(4);
            return;
          }
          // Data is malformed — clear it
          localStorage.removeItem(STORAGE_KEY(user.email));
        } catch {
          localStorage.removeItem(STORAGE_KEY(user.email));
        }
      }
      setGoogleUser(user);
      setIsLoggedIn(true);
      setShowLogin(false);
      setStep(1);
    };

    return (
      <>
        <motion.div
          animate={showLogin ? { scale: 0.97, opacity: 0 } : { scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          style={{ pointerEvents: showLogin ? 'none' : undefined }}
        >
          <Layout onLogoClick={handleLogoClick} onSignIn={() => setShowLogin(true)}>
            <WelcomePage
              onGetStarted={() => { setIsLoggedIn(false); setEnteredViaOverlay(false); setStep(1); }}
              onSignIn={() => setShowLogin(true)}
            />
          </Layout>
        </motion.div>

        <SignInOverlay
          isVisible={showLogin}
          googleOAuthEnabled={googleOAuthEnabled}
          onLogin={handleLogin}
          onGuestContinue={() => { setIsLoggedIn(false); setShowLogin(false); setEnteredViaOverlay(true); setStep(1); }}
          onClose={() => setShowLogin(false)}
        />
      </>
    );
  }

  if (step === 1) return (
      <Layout onLogoClick={handleLogoClick} user={isLoggedIn ? googleUser : undefined} onSignOut={isLoggedIn ? handleSignOut : undefined} fullViewport>
        <UploadScreen
        file={file}
        department={department}
        onFileChange={handleFileChange}
        onClearFile={() => setFile(null)}
        setDepartment={setDepartment}
        onNext={handleUploadAndParse}
        onSkipTranscript={() => { setCompletedCourses([]); setInProgressCourses([]); setStep(3); }}
        onBack={() => { if (enteredViaOverlay) { setEnteredViaOverlay(false); setStep(0); setShowLogin(true); } else { setStep(0); } }}
        isLoading={isLoading}
      />
    </Layout>
  );

  if (step === 2) return (
    <Layout onLogoClick={handleLogoClick} user={isLoggedIn ? googleUser : undefined} onSignOut={isLoggedIn ? handleSignOut : undefined} fullViewport>
      <TranscriptReview
        courses={completedCourses}
        inProgressCourses={inProgressCourses}
        onNext={() => setStep(3)}
        onBack={() => setStep(1)}
      />
    </Layout>
  );

  // Step 3: branches based on login state
  if (step === 3) {
    if (isLoggedIn) {
      // Signed-in flow: collect preferences first, then show plan setup
      if (!userPrefs) {
        return (
          <Layout onLogoClick={handleLogoClick} user={googleUser} onSignOut={handleSignOut} fullViewport>
            <ProfessorPreferencesOnboarding
              onBack={() => setStep(completedCourses.length > 0 || inProgressCourses.length > 0 ? 2 : 1)}
              onComplete={(p, l, a) => setUserPrefs(onboardingSelectionsToPreferences(p, l, a))}
            />
          </Layout>
        );
      }
      
      // Use new PlanDegreePage UI if enabled
      if (usePlanDegreePage) {
        return (
          <>
            <Layout onLogoClick={handleLogoClick} user={googleUser} onSignOut={handleSignOut}>
              <PlanDegreePage
                student={planDegreeData.student}
                requiredCourses={planDegreeData.requiredCourses}
                electiveCourses={planDegreeData.electiveCourses}
                electiveGroups={planDegreeData.electiveGroups}
                loading={isLoading}
                onComplete={handlePlanDegreeComplete}
                onBack={() => setUserPrefs(null)}
              />
            </Layout>
            <ProcessingOverlay
              isVisible={isLoading}
              title="Building Your Degree Plan"
              steps={['Checking prerequisites...', 'Scheduling courses by priority...', 'Finding top professors...', 'Finalizing your plan...']}
              icon="plan"
            />
          </>
        );
      }
      
      // Original DegreePlanSetup UI
      return (
        <Layout onLogoClick={handleLogoClick} user={googleUser} onSignOut={handleSignOut}>
          <DegreePlanSetup
            completedCourses={completedCourses}
            inProgressCourses={inProgressCourses}
            department={department}
            onPlanGenerated={handleGenerateDegreePlan}
            isLoading={isLoading}
            onBack={() => setUserPrefs(null)}
          />
        </Layout>
      );
    }
    return (
      <Layout onLogoClick={handleLogoClick} fullViewport>
        <ProfessorPreferencesOnboarding
          onBack={() => setStep(completedCourses.length > 0 || inProgressCourses.length > 0 ? 2 : 1)}
          onComplete={(p, l, a) => handleGenerate(onboardingSelectionsToPreferences(p, l, a))}
        />
        <ProcessingOverlay
          isVisible={isLoading}
          title="Finding your matches"
          steps={['Analyzing preferences...', 'Matching professors...', 'Building your list...']}
          icon="recommend"
        />
      </Layout>
    );
  }

  // Step 4: branches based on login state
  if (step === 4) {
    // Returning user — full SaaS dashboard
    if (isLoggedIn && degreePlan && isReturningUser && googleUser) {
      const handleDashboardNav = (id: string) => {
        switch (id) {
          case 'dashboard':
            // Already on dashboard — no-op
            break;
          case 'plan':
            setIsReturningUser(false); // Goes to SemesterPlanView
            break;
          default:
            // courses, professors, settings — not yet built
            break;
        }
      };

      return (
        <DashboardLayout
          userName={googleUser.name}
          userPicture={googleUser.picture}
          department={getDegreeName(department) || department}
          onSignOut={handleSignOut}
          onNavClick={handleDashboardNav}
          onLogoClick={handleLogoClick}
        >
          <DashboardPage
            plan={degreePlan?.degreePlan || degreePlan}
            completedCourses={completedCourses}
            userName={googleUser.name}
            department={getDegreeName(department) || department}
            college={getCollegeName(department) || 'College of Engineering'}
            onViewPlan={() => setIsReturningUser(false)}
            onEditPlan={handleEditPlan}
            onNewTranscript={handleNewTranscript}
          />
        </DashboardLayout>
      );
    }
    // Full semester plan view
    if (isLoggedIn && degreePlan) {
      return (
        <Layout onLogoClick={handleLogoClick} user={googleUser} onSignOut={handleSignOut}>
          <SemesterPlanView
            plan={degreePlan}
            onBack={() => setStep(3)}
            onEditPlan={handleEditPlan}
            onNewTranscript={handleNewTranscript}
          />
        </Layout>
      );
    }
    if (apiData && userPrefs) {
      return (
        <Layout onLogoClick={handleLogoClick} fullViewport>
          <YourRecommendations
            userData={{
              recommendations: apiData.recommendations,
              electiveRecommendations: apiData.electiveRecommendations || [],
              electiveGroups: apiData.electiveGroups || [],
              stats: apiData.stats,
            }}
            onBack={() => setStep(3)}
            onExport={() => window.print()}
          />
        </Layout>
      );
    }
  }

  return <div>Loading...</div>;
}

export default App;
