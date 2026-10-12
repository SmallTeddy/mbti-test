'use client'

import { useState, useMemo } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Progress } from "@/components/ui/progress"
import { questions } from '../data/questions'
import { personalityDescriptions } from '../data/personalityDescriptions'
import { PersonalityTrait, PersonalityType, Question } from '../types/personality'

const GITHUB_LINK = "https://github.com/SmallTeddy/mbti-test"

// 题目按维度分组:1-50 E/I, 51-100 S/N, 101-150 T/F, 151-200 J/P
const QUESTION_GROUPS: { traitPair: [PersonalityTrait, PersonalityTrait]; range: [number, number] }[] = [
  { traitPair: ['E', 'I'], range: [0, 50] },
  { traitPair: ['S', 'N'], range: [50, 100] },
  { traitPair: ['T', 'F'], range: [100, 150] },
  { traitPair: ['J', 'P'], range: [150, 200] },
]

const QUESTION_COUNT_OPTIONS = [50, 100, 150, 200] as const

// 根据总数从 4 个维度均衡抽取题目,确保每个维度都有近似数量的题目
function pickQuestions(totalCount: number): Question[] {
  if (totalCount >= questions.length) return [...questions]

  const perGroup = Math.floor(totalCount / QUESTION_GROUPS.length)
  const remainder = totalCount - perGroup * QUESTION_GROUPS.length

  const picked: Question[] = []
  QUESTION_GROUPS.forEach((group, idx) => {
    const [start, end] = group.range
    const groupQuestions = questions.slice(start, end)
    // 余数依次加到前几组,保证总数精确
    const count = perGroup + (idx < remainder ? 1 : 0)
    // 均匀抽样:步长取整,确保分布在整个区间
    const step = Math.max(1, Math.floor(groupQuestions.length / count))
    const sampled: Question[] = []
    for (let i = 0; i < groupQuestions.length && sampled.length < count; i += step) {
      sampled.push(groupQuestions[i])
    }
    // 若因步长导致不够,从尾部补齐
    let fallbackIdx = groupQuestions.length - 1
    while (sampled.length < count && fallbackIdx >= 0) {
      if (!sampled.includes(groupQuestions[fallbackIdx])) {
        sampled.push(groupQuestions[fallbackIdx])
      }
      fallbackIdx--
    }
    picked.push(...sampled)
  })

  return picked
}

function GithubHeader() {
  return (
    <div className="w-full max-w-2xl mb-6 flex flex-col items-center gap-2 text-center">
      <a
        href={GITHUB_LINK}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-900 text-white text-sm hover:bg-gray-700 transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.605-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
        </svg>
        GitHub
      </a>
      <p className="text-sm text-gray-600">如果喜欢请点个 Star ⭐</p>
    </div>
  )
}

export default function PersonalityTest() {
  const [selectedCount, setSelectedCount] = useState<number | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<PersonalityTrait[]>([])
  const [result, setResult] = useState<PersonalityType | null>(null)

  const activeQuestions = useMemo(() => {
    if (!selectedCount) return [] as Question[]
    return pickQuestions(selectedCount)
  }, [selectedCount])

  const handleStart = (count: number) => {
    setSelectedCount(count)
    setCurrentQuestion(0)
    setAnswers([])
    setResult(null)
  }

  const handleAnswer = (trait: PersonalityTrait) => {
    const newAnswers = [...answers, trait]
    setAnswers(newAnswers)

    if (currentQuestion < activeQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      const personalityType = calculatePersonalityType(newAnswers)
      setResult(personalityType)
    }
  }

  const calculatePersonalityType = (answers: PersonalityTrait[]): PersonalityType => {
    const counts: Record<PersonalityTrait, number> = {
      'E': 0, 'I': 0, 'S': 0, 'N': 0, 'T': 0, 'F': 0, 'J': 0, 'P': 0
    }

    answers.forEach(trait => counts[trait]++)

    const type = `${counts['E'] > counts['I'] ? 'E' : 'I'}${counts['S'] > counts['N'] ? 'S' : 'N'}${counts['T'] > counts['F'] ? 'T' : 'F'}${counts['J'] > counts['P'] ? 'J' : 'P'}` as PersonalityType

    return type
  }

  const resetTest = () => {
    setSelectedCount(null)
    setCurrentQuestion(0)
    setAnswers([])
    setResult(null)
  }

  if (result) {
    const personalityResult = personalityDescriptions[result] || { type: result, description: "描述暂未提供。", details: "" }
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        <GithubHeader />
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-2xl sm:text-3xl text-center">你的人格类型是: {result}</CardTitle>
            <CardDescription className="text-lg text-center mt-4">{personalityResult.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-md mt-4">{personalityResult.details}</p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={resetTest} className="w-full sm:w-auto">重新测试</Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // 开始界面:选择题数
  if (!selectedCount) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        <GithubHeader />
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle className="text-2xl sm:text-3xl text-center">人格测试</CardTitle>
            <CardDescription className="text-lg text-center mt-2">请选择题量开始测试</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {QUESTION_COUNT_OPTIONS.map((count) => (
                <Button
                  key={count}
                  variant="outline"
                  onClick={() => handleStart(count)}
                  className="h-24 sm:h-28 text-lg sm:text-xl flex flex-col gap-1"
                >
                  <span className="font-semibold">{count} 题</span>
                  <span className="text-xs text-gray-500 font-normal">
                    约 {Math.ceil(count * 0.2)} 分钟
                  </span>
                </Button>
              ))}
            </div>
            <p className="text-sm text-gray-500 text-center mt-4">
              四个维度(E/I、S/N、T/F、J/P)均衡抽题
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <GithubHeader />
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl sm:text-3xl text-center">人格测试</CardTitle>
          <CardDescription className="text-lg text-center mt-2">问题 {currentQuestion + 1} / {activeQuestions.length}</CardDescription>
          <Progress value={(currentQuestion + 1) / activeQuestions.length * 100} className="mt-4" />
        </CardHeader>
        <CardContent>
          <form>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="question" className="text-xl text-left mb-4">{activeQuestions[currentQuestion].text}</Label>
                <RadioGroup key={currentQuestion} onValueChange={(value) => handleAnswer(activeQuestions[currentQuestion].options[parseInt(value)].trait)} className="flex flex-col space-y-2">
                  {activeQuestions[currentQuestion].options.map((option, index) => (
                    <label key={`${currentQuestion}-${index}`} className="flex items-center space-x-2 justify-start">
                      <RadioGroupItem value={String(index)} id={`option-${currentQuestion}-${index}`} />
                      <Label htmlFor={`option-${currentQuestion}-${index}`} className="text-lg cursor-pointer">{option.text}</Label>
                    </label>
                  ))}
                </RadioGroup>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
