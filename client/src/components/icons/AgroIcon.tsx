import { SVGProps } from 'react'

export function AgroIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 500 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M250 100C250 100 180 150 180 250C180 350 250 400 250 400"
        stroke="currentColor"
        strokeWidth="40"
        strokeLinecap="round"
        className="path-1"
      />
      <path
        d="M250 100C250 100 320 150 320 250C320 350 250 400 250 400"
        stroke="currentColor"
        strokeWidth="40"
        strokeLinecap="round"
        className="path-2"
      />
      <path
        d="M250 150L200 100H300L250 150Z"
        fill="currentColor"
        className="leaf-1"
      />
      <path
        d="M180 200L150 150L210 170L180 200Z"
        fill="currentColor"
        className="leaf-2"
      />
      <path
        d="M320 200L350 150L290 170L320 200Z"
        fill="currentColor"
        className="leaf-3"
      />
      <path
        d="M150 350C150 402.467 192.533 445 245 445C297.467 445 340 402.467 340 350C340 297.533 297.467 255 245 255"
        stroke="currentColor"
        strokeWidth="40"
        strokeLinecap="round"
        className="gear"
      />
    </svg>
  )
}
